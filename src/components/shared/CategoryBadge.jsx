import { getCategoryMeta } from '@/utils/constants'
import { cn } from '@/lib/utils'

export default function CategoryBadge({ type, category, customCategoryName, className }) {
  const meta = getCategoryMeta(type, category)
  const label =
    category === 'other' && customCategoryName ? customCategoryName : meta.label
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
      style={{
        backgroundColor: `${meta.color}1a`,
        color: meta.color,
      }}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
