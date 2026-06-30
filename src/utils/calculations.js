import { DEBT_CATEGORIES, getCategoryMeta } from './constants'

// Normalize any frequency to a monthly-equivalent amount.
// One-time items are excluded from recurring totals (return 0).
export function toMonthly(amount, frequency) {
  const a = Number(amount) || 0
  switch (frequency) {
    case 'weekly':
      return a * 4.33
    case 'monthly':
      return a
    case 'quarterly':
      return a / 3
    case 'yearly':
      return a / 12
    case 'one-time':
      return 0
    default:
      return a
  }
}

// Sum monthly-equivalent of a list of entries
export function totalMonthly(items = []) {
  return items.reduce((sum, item) => sum + toMonthly(item.amount, item.frequency), 0)
}

// Group entries by category, returning [{ key, label, color, value }]
export function breakdownByCategory(items = [], type) {
  const groups = {}
  for (const item of items) {
    const monthly = toMonthly(item.amount, item.frequency)
    if (monthly <= 0) continue
    const key =
      item.category === 'other' && item.customCategoryName
        ? `other:${item.customCategoryName}`
        : item.category
    if (!groups[key]) {
      const meta = getCategoryMeta(type, item.category)
      groups[key] = {
        key,
        label:
          item.category === 'other' && item.customCategoryName
            ? item.customCategoryName
            : meta.label,
        color: meta.color,
        value: 0,
      }
    }
    groups[key].value += monthly
  }
  return Object.values(groups).sort((a, b) => b.value - a.value)
}

// Debt-to-Income Ratio (%)
export function calculateDTI(monthlyDebtPayments, monthlyIncome) {
  if (!monthlyIncome || monthlyIncome === 0) return 0
  return (monthlyDebtPayments / monthlyIncome) * 100
}

export function dtiStatus(ratio) {
  if (ratio < 30) return { label: 'Healthy', tone: 'income' }
  if (ratio <= 50) return { label: 'Moderate', tone: 'warning' }
  return { label: 'High Risk', tone: 'expense' }
}

// Monthly debt payments (EMI / loan categories only), normalized to monthly
export function monthlyDebtPayments(expenses = []) {
  return expenses
    .filter((e) => DEBT_CATEGORIES.includes(e.category))
    .reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0)
}

// Total interest remaining on a loan
export function totalInterestRemaining(emi, tenure, outstanding) {
  const e = Number(emi) || 0
  const t = Number(tenure) || 0
  const o = Number(outstanding) || 0
  if (!t || !o) return 0
  const result = e * t - o
  return result > 0 ? result : 0
}

// Total outstanding debt burden
export function totalDebtBurden(expenses = []) {
  return expenses.reduce((sum, e) => sum + (Number(e.totalOutstanding) || 0), 0)
}

// Build the debt liability table rows
export function debtTableRows(expenses = []) {
  return expenses
    .filter(
      (e) =>
        DEBT_CATEGORIES.includes(e.category) ||
        Number(e.totalOutstanding) > 0 ||
        Number(e.remainingTenure) > 0,
    )
    .map((e) => {
      const emi = toMonthly(e.amount, e.frequency)
      return {
        id: e.id,
        name: e.lenderName || getCategoryMeta('expense', e.category).label,
        category: e.category,
        emi,
        outstanding: Number(e.totalOutstanding) || 0,
        interestRate: e.interestRate ?? null,
        tenure: Number(e.remainingTenure) || 0,
        totalInterest: totalInterestRemaining(emi, e.remainingTenure, e.totalOutstanding),
      }
    })
}

// Estimated debt-free date: today + max(remainingTenure) months
export function estimateDebtFreeDate(expenses = []) {
  const tenures = expenses
    .map((e) => Number(e.remainingTenure) || 0)
    .filter((t) => t > 0)
  if (tenures.length === 0) return null
  const maxTenure = Math.max(...tenures)
  const d = new Date()
  d.setMonth(d.getMonth() + maxTenure)
  return d
}

// Disposable income figure + percentage of income
export function disposableIncome(monthlyIncome, monthlyExpenses) {
  const disposable = monthlyIncome - monthlyExpenses
  const percent = monthlyIncome > 0 ? (disposable / monthlyIncome) * 100 : 0
  return { disposable, percent }
}

// Last N months income vs expense trend, derived from entry dates.
// Recurring (non one-time) items are counted in every month they were active
// (from their start date onward); one-time items count only in their month.
export function monthlyTrend(incomes = [], expenses = [], months = 6) {
  const now = new Date()
  const buckets = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      date: d,
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      income: 0,
      expense: 0,
    })
  }

  const accumulate = (items, field) => {
    for (const item of items) {
      const start = item.date || item.dueDate ? new Date(item.date || item.dueDate) : null
      if (item.frequency === 'one-time') {
        // One-time items count only in the month they occurred.
        for (const bucket of buckets) {
          if (
            start &&
            start.getFullYear() === bucket.date.getFullYear() &&
            start.getMonth() === bucket.date.getMonth()
          ) {
            bucket[field] += Number(item.amount) || 0
          }
        }
      } else {
        // Recurring items represent an ongoing monthly amount and are shown
        // across every month of the trend for a consistent comparison.
        const monthly = toMonthly(item.amount, item.frequency)
        for (const bucket of buckets) {
          bucket[field] += monthly
        }
      }
    }
  }

  accumulate(incomes, 'income')
  accumulate(expenses, 'expense')
  return buckets.map((b) => ({
    label: b.label,
    income: Math.round(b.income),
    expense: Math.round(b.expense),
  }))
}
