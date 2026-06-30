import { useState } from 'react'
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
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
import IncomeForm from './IncomeForm'
import { formatDate } from '@/utils/formatters'
import { FREQUENCIES } from '@/utils/constants'
import { useToast } from '@/components/ui/toast'

const freqLabel = (v) => FREQUENCIES.find((f) => f.value === v)?.label || v

export default function IncomeList({
  incomes,
  addIncome,
  updateIncome,
  deleteIncome,
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
      updateIncome(editing.id, record)
      toast({ variant: 'success', title: 'Income updated' })
    } else {
      addIncome(record)
      toast({ variant: 'success', title: 'Income added' })
    }
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteIncome(deleteTarget.id)
      toast({ variant: 'success', title: 'Income deleted' })
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Income sources</h2>
          <p className="text-sm text-muted-foreground">
            {incomes.length} {incomes.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <Button variant="income" onClick={openAdd}>
          <Plus className="size-4" /> Add income
        </Button>
      </div>

      {incomes.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No income added yet"
          description="Add your salary, freelance earnings, investments and more — or import them from a document."
          actionLabel="Add income"
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
                <TableHead>Frequency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <CategoryBadge
                        type="income"
                        category={income.category}
                        customCategoryName={income.customCategoryName}
                      />
                      {income.source !== 'manual' && (
                        <span className="text-xs text-muted-foreground">
                          via {income.source}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{freqLabel(income.frequency)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(income.date)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <AmountDisplay amount={income.amount} tone="income" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(income)}
                        aria-label="Edit income"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(income)}
                        aria-label="Delete income"
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
        <DialogContent onClose={() => setFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit income' : 'Add income'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update this income source.' : 'Record a new income source.'}
            </DialogDescription>
          </DialogHeader>
          <IncomeForm
            entry={editing}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this income?</DialogTitle>
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
