import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EXPENSE_CATEGORIES, FREQUENCIES, DEBT_CATEGORIES } from '@/utils/constants'
import { todayISO } from '@/utils/formatters'

export default function ExpenseForm({ entry, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    category: entry?.category || 'rent',
    customCategoryName: entry?.customCategoryName || '',
    amount: entry?.amount ?? '',
    frequency: entry?.frequency || 'monthly',
    dueDate: entry?.dueDate || todayISO(),
    lenderName: entry?.lenderName || '',
    remainingTenure: entry?.remainingTenure ?? '',
    totalOutstanding: entry?.totalOutstanding ?? '',
    interestRate: entry?.interestRate ?? '',
    notes: entry?.notes || '',
  }))
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const isDebt = DEBT_CATEGORIES.includes(form.category)

  const validate = () => {
    const e = {}
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter an amount greater than 0'
    if (form.category === 'other' && !form.customCategoryName.trim())
      e.customCategoryName = 'Name this category'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    const num = (v) => (v === '' || v == null ? undefined : Number(v))
    onSubmit({
      ...entry,
      category: form.category,
      customCategoryName: form.category === 'other' ? form.customCategoryName.trim() : undefined,
      amount: Number(form.amount),
      frequency: form.frequency,
      dueDate: form.dueDate || undefined,
      lenderName: form.lenderName.trim() || undefined,
      remainingTenure: num(form.remainingTenure),
      totalOutstanding: num(form.totalOutstanding),
      interestRate: num(form.interestRate),
      notes: form.notes.trim() || undefined,
      source: entry?.source || 'manual',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="exp-category">Category</Label>
          <Select id="exp-category" value={form.category} onValueChange={(v) => set('category', v)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exp-amount">Amount (₹)</Label>
          <Input
            id="exp-amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
        </div>
      </div>

      {form.category === 'other' && (
        <div className="space-y-1.5">
          <Label htmlFor="exp-custom">Custom category name</Label>
          <Input
            id="exp-custom"
            placeholder="e.g. Gym membership"
            value={form.customCategoryName}
            onChange={(e) => set('customCategoryName', e.target.value)}
          />
          {errors.customCategoryName && (
            <p className="text-xs text-destructive">{errors.customCategoryName}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="exp-frequency">Frequency</Label>
          <Select id="exp-frequency" value={form.frequency} onValueChange={(v) => set('frequency', v)}>
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exp-due">Due date</Label>
          <Input
            id="exp-due"
            type="date"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Loan / debt details {isDebt ? '' : '(optional)'}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="exp-lender">Lender name</Label>
            <Input
              id="exp-lender"
              placeholder="e.g. HDFC Home Loan"
              value={form.lenderName}
              onChange={(e) => set('lenderName', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-tenure">Remaining tenure (months)</Label>
            <Input
              id="exp-tenure"
              type="number"
              min="0"
              placeholder="e.g. 180"
              value={form.remainingTenure}
              onChange={(e) => set('remainingTenure', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-outstanding">Total outstanding (₹)</Label>
            <Input
              id="exp-outstanding"
              type="number"
              min="0"
              placeholder="e.g. 2800000"
              value={form.totalOutstanding}
              onChange={(e) => set('totalOutstanding', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-interest">Interest rate (% p.a.)</Label>
            <Input
              id="exp-interest"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 8.5"
              value={form.interestRate}
              onChange={(e) => set('interestRate', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="exp-notes">Notes (optional)</Label>
        <Textarea
          id="exp-notes"
          rows={2}
          placeholder="Any extra context"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="expense">
          {entry ? 'Save changes' : 'Add expense'}
        </Button>
      </div>
    </form>
  )
}
