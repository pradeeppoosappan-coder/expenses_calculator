import { LayoutDashboard, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/shared/EmptyState'
import IncomeSummary from './IncomeSummary'
import ExpenseSummary from './ExpenseSummary'
import FinancialHealth from './FinancialHealth'
import CashFlowChart from './CashFlowChart'
import SpendingInsight from './SpendingInsight'

export default function DashboardPage({
  incomes,
  expenses,
  onGoToImport,
  onLoadSample,
}) {
  const isEmpty = incomes.length === 0 && expenses.length === 0

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState
          icon={LayoutDashboard}
          title="Welcome to FinTrack"
          description="Start by importing a document with AI, adding income and expenses manually, or loading sample data to explore the dashboard."
          actionLabel="Import with AI"
          onAction={onGoToImport}
          secondaryLabel="Load sample data"
          onSecondary={onLoadSample}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Financial Dashboard</h2>
          <p className="text-sm text-muted-foreground">Your complete money overview</p>
        </div>
        <Button variant="outline" size="sm" onClick={onLoadSample}>
          <Database className="size-4" /> Load sample data
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeSummary incomes={incomes} onGoToImport={onGoToImport} />
        <ExpenseSummary expenses={expenses} onGoToImport={onGoToImport} />
      </div>

      <FinancialHealth incomes={incomes} expenses={expenses} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CashFlowChart incomes={incomes} expenses={expenses} />
        <SpendingInsight incomes={incomes} expenses={expenses} />
      </div>
    </div>
  )
}
