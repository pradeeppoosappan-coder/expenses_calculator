import { Lightbulb, CalendarCheck, PiggyBank, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  totalMonthly,
  monthlyDebtPayments,
  disposableIncome,
  estimateDebtFreeDate,
} from '@/utils/calculations'
import { formatCurrency, formatMonthYear } from '@/utils/formatters'

function InsightRow({ icon: Icon, tone, children }) {
  const toneClass =
    tone === 'income'
      ? 'bg-income/10 text-income'
      : tone === 'expense'
        ? 'bg-expense/10 text-expense'
        : 'bg-primary/10 text-primary'
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon className="size-4" />
      </span>
      <p className="text-sm leading-relaxed">{children}</p>
    </li>
  )
}

export default function SpendingInsight({ incomes, expenses }) {
  const monthlyIncome = totalMonthly(incomes)
  const monthlyExpenses = totalMonthly(expenses)
  const debtPayments = monthlyDebtPayments(expenses)
  const { disposable } = disposableIncome(monthlyIncome, monthlyExpenses)
  const debtFree = estimateDebtFreeDate(expenses)

  const hasData = incomes.length > 0 || expenses.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="size-4" />
          </span>
          Spending Capacity Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Add income and expenses to unlock personalized insights.
          </p>
        ) : (
          <ul className="space-y-4">
            {disposable >= 0 ? (
              <InsightRow icon={PiggyBank} tone="income">
                After all obligations, you can spend{' '}
                <strong className="text-income">{formatCurrency(disposable)}</strong> per month.
              </InsightRow>
            ) : (
              <InsightRow icon={AlertTriangle} tone="expense">
                Your expenses exceed income by{' '}
                <strong className="text-expense">{formatCurrency(Math.abs(disposable))}</strong> per
                month. Consider reducing discretionary spending or restructuring debt.
              </InsightRow>
            )}

            {debtFree ? (
              <InsightRow icon={CalendarCheck} tone="default">
                At the current rate, you'll be debt-free by{' '}
                <strong>{formatMonthYear(debtFree)}</strong>.
              </InsightRow>
            ) : (
              <InsightRow icon={CalendarCheck} tone="income">
                You have no tracked loans with a remaining tenure — you're debt-free! 🎉
              </InsightRow>
            )}

            {debtPayments > 0 && monthlyIncome > 0 && (
              <InsightRow icon={Lightbulb} tone="default">
                Debt payments consume{' '}
                <strong>{formatCurrency(debtPayments)}</strong> of your monthly income
                {' '}({((debtPayments / monthlyIncome) * 100).toFixed(0)}%). Paying these down
                frees up cash flow.
              </InsightRow>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
