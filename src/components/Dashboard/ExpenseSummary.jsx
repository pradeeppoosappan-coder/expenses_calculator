import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AmountDisplay from '@/components/shared/AmountDisplay'
import EmptyState from '@/components/shared/EmptyState'
import { breakdownByCategory, totalMonthly } from '@/utils/calculations'
import { formatCurrency } from '@/utils/formatters'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{p.name}</p>
      <p className="text-expense">{formatCurrency(p.value)}/mo</p>
    </div>
  )
}

export default function ExpenseSummary({ expenses, onGoToImport }) {
  const monthly = totalMonthly(expenses)
  const breakdown = breakdownByCategory(expenses, 'expense')

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex size-8 items-center justify-center rounded-lg bg-expense/10 text-expense">
              <TrendingDown className="size-4" />
            </span>
            Monthly Expenses
          </CardTitle>
        </div>
        <AmountDisplay amount={monthly} className="text-3xl font-bold text-expense" />
        <p className="text-xs text-muted-foreground">Normalized to monthly equivalent</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {breakdown.length === 0 ? (
          <EmptyState
            icon={TrendingDown}
            title="No expenses yet"
            description="Add an expense to see your breakdown."
            actionLabel="Import a document"
            onAction={onGoToImport}
          />
        ) : (
          <>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {breakdown.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5">
              {breakdown.map((b) => (
                <li key={b.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                    {b.label}
                  </span>
                  <AmountDisplay amount={b.value} className="font-medium" />
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
