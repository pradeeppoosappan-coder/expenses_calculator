import { useState } from 'react'
import { Plus, Pencil, Trash2, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import CategoryBadge from '@/components/shared/CategoryBadge'
import AmountDisplay from '@/components/shared/AmountDisplay'
import EmptyState from '@/components/shared/EmptyState'
import ExpenseForm from './ExpenseForm'
import { formatDate } from '@/utils/formatters'
import { FREQUENCIES } from '@/utils/constants'
import { useToast } from '@/components/ui/toast'

const freqLabel = (v) => FREQUENCIES.find((f) => f.value === v)?.label || v

export default function ExpenseList({
  expenses,
  addExpense,
  updateExpense,
  deleteExpense,
  onGoToImport,
}) {
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (entry) => {
    setEditing(entry)
    setFormOpen(true)
  }

  const handleSubmit = (record) => {
    if (editing) {
      updateExpense(editing.id, record)
      toast({ variant: 'success', title: 'Expense updated' })
    } else {
      addExpense(record)
      toast({ variant: 'success', title: 'Expense added' })
    }
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteExpense(deleteTarget.id)
      toast({ variant: 'success', title: 'Expense deleted' })
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Expenses & liabilities</h2>
          <p className="text-sm text-muted-foreground">
            {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <Button variant="expense" onClick={openAdd}>
          <Plus className="size-4" /> Add expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title="No expenses added yet"
          description="Track EMIs, loans, rent, utilities and more — or import them from a statement."
          actionLabel="Add expense"
          onAction={openAdd}
          secondaryLabel="Import from document"
          onSecondary={onGoToImport}
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Lender / Notes</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <CategoryBadge
                        type="expense"
                        category={expense.category}
                        customCategoryName={expense.customCategoryName}
                      />
                      {expense.source !== 'manual' && (
                        <span className="text-xs text-muted-foreground">
                          via {expense.source}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <span className="text-sm">
                      {expense.lenderName || expense.notes || '—'}
                    </span>
                    {expense.interestRate != null && (
                      <span className="block text-xs text-muted-foreground">
                        {expense.interestRate}% p.a.
                        {expense.remainingTenure ? ` · ${expense.remainingTenure} mo left` : ''}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{freqLabel(expense.frequency)}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {expense.totalOutstanding ? (
                      <AmountDisplay amount={expense.totalOutstanding} />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <AmountDisplay amount={expense.amount} tone="expense" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(expense)}
                        aria-label="Edit expense"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(expense)}
                        aria-label="Delete expense"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent onClose={() => setFormOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit expense' : 'Add expense'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update this expense or liability.' : 'Record a new expense or liability.'}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            entry={editing}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this expense?</DialogTitle>
            <DialogDescription>
              This will permanently remove the entry. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
