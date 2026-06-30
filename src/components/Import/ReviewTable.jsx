import { useState } from 'react'
import { Trash2, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  FREQUENCIES,
} from '@/utils/constants'
import { cn } from '@/lib/utils'

// Fields that, when null/empty, should be highlighted for review
const isMissing = (v) => v === null || v === undefined || v === ''

export default function ReviewTable({ items, onConfirm, onCancel }) {
  const [rows, setRows] = useState(() =>
    items.map((it, i) => ({ ...it, _key: `row-${i}` })),
  )

  const update = (key, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r._key !== key) return r
        const next = { ...r, [field]: value }
        // reset category when switching type so it stays valid
        if (field === 'type') {
          next.category = value === 'income' ? 'employment_salary' : 'rent'
        }
        return next
      }),
    )
  }

  const removeRow = (key) => setRows((prev) => prev.filter((r) => r._key !== key))

  const handleConfirm = () => {
    const cleaned = rows.map(({ _key, ...rest }) => ({
      ...rest,
      amount: Number(rest.amount) || 0,
      remainingTenure: rest.remainingTenure ? Number(rest.remainingTenure) : undefined,
      totalOutstanding: rest.totalOutstanding ? Number(rest.totalOutstanding) : undefined,
      interestRate: rest.interestRate ? Number(rest.interestRate) : undefined,
      date: rest.type === 'income' ? rest.date || undefined : undefined,
      dueDate: rest.type === 'expense' ? rest.date || undefined : undefined,
    }))
    onConfirm(cleaned)
  }

  const incomeCount = rows.filter((r) => r.type === 'income').length
  const expenseCount = rows.length - incomeCount

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Review extracted items</h3>
          <p className="text-sm text-muted-foreground">
            Edit any field before saving. Highlighted cells are missing data.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-income/10 text-income">
            {incomeCount} income
          </Badge>
          <Badge variant="secondary" className="bg-expense/10 text-expense">
            {expenseCount} expense
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="min-w-[110px]">Amount (₹)</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="min-w-[140px]">Lender / Notes</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const categories =
                row.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
              return (
                <TableRow key={row._key}>
                  <TableCell>
                    <Select
                      value={row.type}
                      onValueChange={(v) => update(row._key, 'type', v)}
                      className="h-9 min-w-[110px]"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.category}
                      onValueChange={(v) => update(row._key, 'category', v)}
                      className="h-9 min-w-[150px]"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                    {row.category === 'other' && (
                      <Input
                        value={row.customCategoryName || ''}
                        onChange={(e) => update(row._key, 'customCategoryName', e.target.value)}
                        placeholder="Custom name"
                        className={cn(
                          'mt-1 h-8',
                          isMissing(row.customCategoryName) && 'bg-yellow-100 dark:bg-yellow-900/30',
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.amount ?? ''}
                      onChange={(e) => update(row._key, 'amount', e.target.value)}
                      className={cn(
                        'h-9 w-[110px]',
                        (isMissing(row.amount) || Number(row.amount) <= 0) &&
                          'bg-yellow-100 dark:bg-yellow-900/30',
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.frequency}
                      onValueChange={(v) => update(row._key, 'frequency', v)}
                      className="h-9 min-w-[120px]"
                    >
                      {FREQUENCIES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={row.date || ''}
                      onChange={(e) => update(row._key, 'date', e.target.value)}
                      className={cn(
                        'h-9 w-[150px]',
                        isMissing(row.date) && 'bg-yellow-100 dark:bg-yellow-900/30',
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.lenderName || row.notes || ''}
                      onChange={(e) => update(row._key, 'lenderName', e.target.value)}
                      placeholder="—"
                      className="h-9 min-w-[140px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => removeRow(row._key)}
                      aria-label="Remove row"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {rows.some(
        (r) =>
          isMissing(r.amount) ||
          Number(r.amount) <= 0 ||
          isMissing(r.date) ||
          (r.category === 'other' && isMissing(r.customCategoryName)),
      ) && (
        <p className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-4" /> Some fields are missing — fill the highlighted cells
          for the most accurate dashboard.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={rows.length === 0}>
          <Check className="size-4" /> Save {rows.length} {rows.length === 1 ? 'item' : 'items'}
        </Button>
      </div>
    </div>
  )
}
