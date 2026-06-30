import { Wallet, Gauge, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AmountDisplay from '@/components/shared/AmountDisplay'
import CategoryBadge from '@/components/shared/CategoryBadge'
import {
  totalMonthly,
  monthlyDebtPayments,
  calculateDTI,
  dtiStatus,
  debtTableRows,
  totalDebtBurden,
  disposableIncome,
} from '@/utils/calculations'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { cn } from '@/lib/utils'

function DtiGauge({ ratio }) {
  const status = dtiStatus(ratio)
  const clamped = Math.min(100, Math.max(0, ratio))
  // Semi-circle gauge: -90deg (0%) to +90deg (100%)
  const angle = -90 + (clamped / 100) * 180
  const toneColor =
    status.tone === 'income'
      ? 'hsl(var(--income))'
      : status.tone === 'expense'
        ? 'hsl(var(--expense))'
        : '#f59e0b'

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[110px] w-[200px] overflow-hidden">
        <div
          className="absolute left-0 top-0 h-[200px] w-[200px] rounded-full"
          style={{
            background:
              'conic-gradient(from -90deg, hsl(var(--income)) 0deg 54deg, #f59e0b 54deg 90deg, hsl(var(--expense)) 90deg 180deg, transparent 180deg)',
            WebkitMask: 'radial-gradient(circle at center, transparent 56px, #000 57px)',
            mask: 'radial-gradient(circle at center, transparent 56px, #000 57px)',
          }}
        />
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 h-[88px] w-[3px] origin-bottom rounded-full bg-foreground transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-background bg-foreground" />
      </div>
      <div className="mt-1 text-center">
        <p className="text-3xl font-bold tabular-nums" style={{ color: toneColor }}>
          {formatPercent(ratio)}
        </p>
        <Badge
          className="mt-1"
          style={{ backgroundColor: `${toneColor}22`, color: toneColor }}
        >
          {status.label}
        </Badge>
      </div>
      <div className="mt-3 flex w-full justify-between px-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Healthy &lt;30%</span>
        <span>Moderate</span>
        <span>High &gt;50%</span>
      </div>
    </div>
  )
}

export default function FinancialHealth({ incomes, expenses }) {
  const monthlyIncome = totalMonthly(incomes)
  const monthlyExpenses = totalMonthly(expenses)
  const debtPayments = monthlyDebtPayments(expenses)
  const dti = calculateDTI(debtPayments, monthlyIncome)
  const { disposable, percent } = disposableIncome(monthlyIncome, monthlyExpenses)
  const rows = debtTableRows(expenses)
  const debtBurden = totalDebtBurden(expenses)
  const positive = disposable >= 0

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Disposable income */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="size-4" />
              </span>
              Disposable Income
            </CardTitle>
            <CardDescription>What's left after all expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                'text-4xl font-bold tabular-nums',
                positive ? 'text-income' : 'text-expense',
              )}
            >
              {formatCurrency(disposable)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {positive ? 'Surplus' : 'Shortfall'} ·{' '}
              <span className={positive ? 'text-income' : 'text-expense'}>
                {formatPercent(percent)}
              </span>{' '}
              of income
            </p>
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total income</span>
                <AmountDisplay amount={monthlyIncome} className="font-medium text-income" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total expenses</span>
                <AmountDisplay amount={monthlyExpenses} className="font-medium text-expense" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DTI gauge */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Gauge className="size-4" />
              </span>
              Debt-to-Income Ratio
            </CardTitle>
            <CardDescription>Monthly debt payments ÷ income</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2">
            <DtiGauge ratio={dti} />
          </CardContent>
        </Card>

        {/* Debt burden */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Landmark className="size-4" />
              </span>
              Total Debt Burden
            </CardTitle>
            <CardDescription>Sum of all outstanding balances</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tabular-nums text-expense">
              {formatCurrency(debtBurden)}
            </p>
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly debt payments</span>
                <AmountDisplay amount={debtPayments} className="font-medium" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active liabilities</span>
                <span className="font-medium">{rows.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt liability table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Debt Liability Summary</CardTitle>
          <CardDescription>
            EMIs, loans and outstanding debts with interest projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No debts or liabilities recorded. Add a loan with outstanding balance and tenure to
              see projections here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Liability</TableHead>
                  <TableHead className="text-right">EMI / Month</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Interest Rate</TableHead>
                  <TableHead className="text-right">Tenure Left</TableHead>
                  <TableHead className="text-right">Total Interest Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{row.name}</span>
                        <CategoryBadge type="expense" category={row.category} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.emi)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.outstanding ? formatCurrency(row.outstanding) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.interestRate != null ? formatPercent(row.interestRate) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.tenure ? `${row.tenure} mo` : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.totalInterest ? formatCurrency(row.totalInterest) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(rows.reduce((s, r) => s + r.emi, 0))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(debtBurden)}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(rows.reduce((s, r) => s + r.totalInterest, 0))}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
