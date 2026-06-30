// Indian-style currency formatting (₹1,00,000)
export function formatCurrency(amount, { decimals = 0, withSymbol = true } = {}) {
  const num = Number(amount) || 0
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(num))
  const sign = num < 0 ? '-' : ''
  return `${sign}${withSymbol ? '₹' : ''}${formatted}`
}

// Compact form for axis labels (₹1.2L, ₹85K)
export function formatCompactCurrency(amount) {
  const num = Number(amount) || 0
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`
  return `${sign}₹${abs}`
}

export function formatPercent(value, decimals = 1) {
  const num = Number(value) || 0
  return `${num.toFixed(decimals)}%`
}

export function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatMonthYear(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

// Today's date as ISO yyyy-mm-dd (local)
export function todayISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}
