// Vercel serverless function: secure proxy to the Anthropic Messages API.
// Keeps ANTHROPIC_API_KEY server-side — it is never shipped to the browser.
// The client posts the standard Messages request body ({ model, max_tokens, messages })
// and this function adds the auth + version headers and forwards it to Anthropic.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: { message: 'Server is not configured with an ANTHROPIC_API_KEY.' } })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!body || !Array.isArray(body.messages)) {
      return res.status(400).json({ error: { message: 'Invalid request body.' } })
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model,
        max_tokens: body.max_tokens,
        messages: body.messages,
      }),
    })

    const data = await upstream.json().catch(() => ({
      error: { message: 'Upstream returned a non-JSON response.' },
    }))
    return res.status(upstream.status).json(data)
  } catch {
    return res.status(502).json({ error: { message: 'Failed to reach the AI service.' } })
  }
}
