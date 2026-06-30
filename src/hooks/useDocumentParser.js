import { useCallback, useState } from 'react'
import { PARSER_MODEL, MAX_FILE_SIZE } from '@/utils/constants'

const SYSTEM_PROMPT = `You are a financial document parser. Extract ALL income or expense line items from the provided document/text/image.
Respond ONLY with valid JSON (no markdown, no backticks, no preamble). Use this exact schema:
{
  "items": [
    {
      "type": "income" | "expense",
      "category": "<best matching category from the list below>",
      "customCategoryName": "<if category is 'other', provide a short name>",
      "amount": <number>,
      "frequency": "monthly" | "one-time" | "weekly" | "quarterly" | "yearly",
      "date": "<ISO date if found, otherwise null>",
      "lenderName": "<if applicable>",
      "remainingTenure": <months if found, otherwise null>,
      "totalOutstanding": <number if found, otherwise null>,
      "interestRate": <annual % if found, otherwise null>,
      "notes": "<any extra context>"
    }
  ]
}
Income categories: employment_salary, freelance, investment, rental, other
Expense categories: monthly_emi, jewel_loan, outside_debt, rent, utilities, groceries, subscriptions, other
Rules:
- Extract every distinct financial line item
- Amounts should be numbers without currency symbols
- If the document is a salary slip, classify as employment_salary and extract net pay
- If the document is a bank statement, classify each credit as income and each debit as expense
- If it's a loan statement, extract EMI amount, outstanding balance, interest rate, and remaining tenure
- If you can't determine a field, set it to null
- NEVER wrap the JSON in backticks or add any text outside the JSON object`

// Read a File into a base64 string (without data: prefix)
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result || ''
      const base64 = String(result).split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Strip code fences / preamble and parse JSON robustly
function extractJson(text) {
  if (!text) throw new Error('Empty response')
  let cleaned = text.trim()
  // Remove markdown fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try {
    return JSON.parse(cleaned)
  } catch {
    // Find the first { and last } and try again
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1))
    }
    throw new Error('Could not parse JSON from response')
  }
}

const VALID_FREQ = ['monthly', 'one-time', 'weekly', 'quarterly', 'yearly']

// Sanitize a single parsed item into our shape
function sanitizeItem(raw) {
  const type = raw.type === 'income' ? 'income' : 'expense'
  let amount = raw.amount
  if (typeof amount === 'string') amount = Number(amount.replace(/[^0-9.-]/g, ''))
  amount = Number(amount)
  if (!Number.isFinite(amount)) amount = 0
  return {
    type,
    category: raw.category || 'other',
    customCategoryName: raw.customCategoryName || undefined,
    amount: Math.abs(amount),
    frequency: VALID_FREQ.includes(raw.frequency) ? raw.frequency : 'monthly',
    date: raw.date || null,
    lenderName: raw.lenderName || undefined,
    remainingTenure: raw.remainingTenure != null ? Number(raw.remainingTenure) : null,
    totalOutstanding: raw.totalOutstanding != null ? Number(raw.totalOutstanding) : null,
    interestRate: raw.interestRate != null ? Number(raw.interestRate) : null,
    notes: raw.notes || undefined,
  }
}

// When VITE_API_PROXY is set (e.g. "/api/parse" on Vercel), requests go through a
// serverless proxy that injects the API key server-side. Otherwise we call the
// Anthropic API directly (the key is supplied by the runtime environment).
const PARSER_ENDPOINT = import.meta.env.VITE_API_PROXY || 'https://api.anthropic.com/v1/messages'

async function callAnthropic(contentBlocks) {
  const response = await fetch(PARSER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: PARSER_MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: contentBlocks }],
    }),
  })

  if (!response.ok) {
    let detail = ''
    try {
      const errBody = await response.json()
      detail = errBody?.error?.message || ''
    } catch {
      /* ignore */
    }
    const err = new Error(detail || `Request failed (${response.status})`)
    err.status = response.status
    throw err
  }

  const data = await response.json()
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
  return text
}

export function useDocumentParser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  const runParse = useCallback(async (contentBlocks) => {
    setLoading(true)
    setError(null)
    try {
      const text = await callAnthropic(contentBlocks)
      const json = extractJson(text)
      const items = Array.isArray(json.items) ? json.items : []
      if (items.length === 0) {
        throw new Error('NO_ITEMS')
      }
      return items.map(sanitizeItem)
    } catch (err) {
      let message = 'Could not parse this document. Please try manual entry.'
      if (err.message === 'NO_ITEMS') {
        message = 'No financial items were found. Try a clearer document or manual entry.'
      } else if (err.status === 401 || err.status === 403) {
        message = 'Authorization failed when contacting the AI service.'
      } else if (err.status === 429) {
        message = 'Rate limit reached. Please wait a moment and retry.'
      } else if (err.status >= 500) {
        message = 'The AI service is temporarily unavailable. Please retry.'
      }
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const parseText = useCallback(
    (pastedText) =>
      runParse([{ type: 'text', text: `${SYSTEM_PROMPT}\n\n--- DOCUMENT TEXT ---\n${pastedText}` }]),
    [runParse],
  )

  const parsePdf = useCallback(
    async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError('File is larger than 10MB. Please upload a smaller file.')
        return null
      }
      const base64 = await fileToBase64(file)
      return runParse([
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
        { type: 'text', text: SYSTEM_PROMPT },
      ])
    },
    [runParse],
  )

  const parseImage = useCallback(
    async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError('File is larger than 10MB. Please upload a smaller file.')
        return null
      }
      const mediaType = file.type || 'image/png'
      const base64 = await fileToBase64(file)
      return runParse([
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: SYSTEM_PROMPT },
      ])
    },
    [runParse],
  )

  return { loading, error, setError, reset, parseText, parsePdf, parseImage }
}
