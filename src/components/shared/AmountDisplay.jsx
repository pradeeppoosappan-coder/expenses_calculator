import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export default function AmountDisplay({
  amount,
  className,
  decimals = 0,
  sign = false,
  tone, // 'income' | 'expense' | undefined
}) {
  const value = Number(amount) || 0
  const prefix = sign && value > 0 ? '+' : ''
  const toneClass =
    tone === 'income'
      ? 'text-income'
      : tone === 'expense'
        ? 'text-expense'
        : ''
  return (
    <span className={cn('tabular-nums', toneClass, className)}>
      {prefix}
      {formatCurrency(value, { decimals })}
    </span>
  )
}
