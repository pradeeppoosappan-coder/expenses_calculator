// Storage
export const STORAGE_KEY = 'financial_tracker_data'

// Anthropic model used for document parsing
export const PARSER_MODEL = 'claude-sonnet-4-6'

// File size limit (10 MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// ---- Frequencies ----
export const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

// ---- Income categories ----
export const INCOME_CATEGORIES = [
  { value: 'employment_salary', label: 'Employment / Salary', color: '#10b981' },
  { value: 'freelance', label: 'Freelance', color: '#0ea5e9' },
  { value: 'investment', label: 'Investment', color: '#8b5cf6' },
  { value: 'rental', label: 'Rental', color: '#f59e0b' },
  { value: 'other', label: 'Other', color: '#64748b' },
]

// ---- Expense categories ----
export const EXPENSE_CATEGORIES = [
  { value: 'monthly_emi', label: 'Monthly EMI', color: '#f43f5e' },
  { value: 'jewel_loan', label: 'Jewel Loan', color: '#ec4899' },
  { value: 'outside_debt', label: 'Outside Debt', color: '#d946ef' },
  { value: 'rent', label: 'Rent', color: '#fb7185' },
  { value: 'utilities', label: 'Utilities', color: '#f97316' },
  { value: 'groceries', label: 'Groceries', color: '#eab308' },
  { value: 'subscriptions', label: 'Subscriptions', color: '#a855f7' },
  { value: 'other', label: 'Other', color: '#94a3b8' },
]

// Categories that represent debt / liabilities (counted toward DTI & debt burden)
export const DEBT_CATEGORIES = ['monthly_emi', 'jewel_loan', 'outside_debt']

export const INCOME_CATEGORY_MAP = Object.fromEntries(
  INCOME_CATEGORIES.map((c) => [c.value, c]),
)
export const EXPENSE_CATEGORY_MAP = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c]),
)

export function getCategoryMeta(type, value) {
  const map = type === 'income' ? INCOME_CATEGORY_MAP : EXPENSE_CATEGORY_MAP
  return map[value] || { value, label: value, color: '#94a3b8' }
}

// ---- Sample data ----
export const SAMPLE_DATA = {
  incomes: [
    { category: 'employment_salary', amount: 85000, frequency: 'monthly', date: '2026-06-01' },
    { category: 'freelance', amount: 25000, frequency: 'monthly', date: '2026-06-15' },
    { category: 'other', customCategoryName: 'YouTube AdSense', amount: 8000, frequency: 'monthly', date: '2026-06-20' },
  ],
  expenses: [
    { category: 'monthly_emi', amount: 18500, frequency: 'monthly', lenderName: 'HDFC Home Loan', remainingTenure: 180, totalOutstanding: 2800000, interestRate: 8.5 },
    { category: 'jewel_loan', amount: 5000, frequency: 'monthly', lenderName: 'Muthoot Finance', remainingTenure: 12, totalOutstanding: 55000, interestRate: 12 },
    { category: 'outside_debt', amount: 10000, frequency: 'monthly', lenderName: 'Personal - Ravi', remainingTenure: 6, totalOutstanding: 60000 },
    { category: 'rent', amount: 15000, frequency: 'monthly' },
    { category: 'utilities', amount: 3500, frequency: 'monthly' },
    { category: 'groceries', amount: 8000, frequency: 'monthly' },
    { category: 'subscriptions', amount: 1500, frequency: 'monthly' },
  ],
}
