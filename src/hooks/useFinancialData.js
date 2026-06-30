import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEY, SAMPLE_DATA } from '@/utils/constants'
import { todayISO } from '@/utils/formatters'

const DEFAULT_DATA = {
  incomes: [],
  expenses: [],
  settings: { currency: 'INR', monthlyBudgetGoal: undefined },
}

function genId() {
  // crypto.randomUUID where available, else fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DATA
    const parsed = JSON.parse(raw)
    return {
      incomes: Array.isArray(parsed.incomes) ? parsed.incomes : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
    }
  } catch {
    return DEFAULT_DATA
  }
}

// Normalize a raw record into a full Income/Expense object
function normalizeRecord(record, type) {
  const base = {
    id: record.id || genId(),
    category: record.category || 'other',
    customCategoryName: record.customCategoryName || undefined,
    amount: Number(record.amount) || 0,
    currency: 'INR',
    frequency: record.frequency || 'monthly',
    source: record.source || 'manual',
    sourceFileName: record.sourceFileName || undefined,
    notes: record.notes || undefined,
    createdAt: record.createdAt || new Date().toISOString(),
  }
  if (type === 'income') {
    return { ...base, date: record.date || todayISO() }
  }
  return {
    ...base,
    dueDate: record.dueDate || undefined,
    remainingTenure: record.remainingTenure != null ? Number(record.remainingTenure) : undefined,
    totalOutstanding: record.totalOutstanding != null ? Number(record.totalOutstanding) : undefined,
    interestRate: record.interestRate != null ? Number(record.interestRate) : undefined,
    lenderName: record.lenderName || undefined,
  }
}

export function useFinancialData() {
  const [data, setData] = useState(loadData)

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      // storage full or unavailable — fail silently
      console.error('Failed to persist financial data', err)
    }
  }, [data])

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setData(loadData())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addIncome = useCallback((record) => {
    const item = normalizeRecord(record, 'income')
    setData((prev) => ({ ...prev, incomes: [item, ...prev.incomes] }))
    return item
  }, [])

  const addExpense = useCallback((record) => {
    const item = normalizeRecord(record, 'expense')
    setData((prev) => ({ ...prev, expenses: [item, ...prev.expenses] }))
    return item
  }, [])

  const addMany = useCallback((items = []) => {
    const incomes = []
    const expenses = []
    for (const it of items) {
      if (it.type === 'income') incomes.push(normalizeRecord(it, 'income'))
      else expenses.push(normalizeRecord(it, 'expense'))
    }
    setData((prev) => ({
      ...prev,
      incomes: [...incomes, ...prev.incomes],
      expenses: [...expenses, ...prev.expenses],
    }))
    return { incomes: incomes.length, expenses: expenses.length }
  }, [])

  const updateIncome = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.map((i) => (i.id === id ? { ...i, ...patch, id } : i)),
    }))
  }, [])

  const updateExpense = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...patch, id } : e)),
    }))
  }, [])

  const deleteIncome = useCallback((id) => {
    setData((prev) => ({ ...prev, incomes: prev.incomes.filter((i) => i.id !== id) }))
  }, [])

  const deleteExpense = useCallback((id) => {
    setData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }))
  }, [])

  const updateSettings = useCallback((patch) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const loadSampleData = useCallback(() => {
    const incomes = SAMPLE_DATA.incomes.map((i) =>
      normalizeRecord({ ...i, source: 'manual' }, 'income'),
    )
    const expenses = SAMPLE_DATA.expenses.map((e) =>
      normalizeRecord({ ...e, source: 'manual' }, 'expense'),
    )
    setData((prev) => ({ ...prev, incomes, expenses }))
  }, [])

  const clearAll = useCallback(() => {
    setData((prev) => ({ ...prev, incomes: [], expenses: [] }))
  }, [])

  // Duplicate detection: same amount + date + category
  const findDuplicate = useCallback(
    (type, record) => {
      const list = type === 'income' ? data.incomes : data.expenses
      const recDate = record.date || record.dueDate || null
      return list.find(
        (i) =>
          Number(i.amount) === Number(record.amount) &&
          i.category === record.category &&
          (i.date || i.dueDate || null) === recDate,
      )
    },
    [data.incomes, data.expenses],
  )

  return {
    data,
    incomes: data.incomes,
    expenses: data.expenses,
    settings: data.settings,
    addIncome,
    addExpense,
    addMany,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    updateSettings,
    loadSampleData,
    clearAll,
    findDuplicate,
  }
}
