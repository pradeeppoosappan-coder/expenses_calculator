import * as React from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = React.createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const remove = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    ({ title, description, variant = 'default', duration = 3500 }) => {
      idCounter += 1
      const id = idCounter
      setToasts((prev) => [...prev, { id, title, description, variant }])
      if (duration > 0) {
        setTimeout(() => remove(id), duration)
      }
      return id
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) return { toast: () => {} }
  return ctx
}

const variantConfig = {
  default: { icon: Info, classes: 'border-border' },
  success: { icon: CheckCircle2, classes: 'border-income/40' },
  destructive: { icon: AlertCircle, classes: 'border-destructive/50' },
}

const iconColor = {
  default: 'text-primary',
  success: 'text-income',
  destructive: 'text-destructive',
}

function Toaster({ toasts, onDismiss }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="pointer-events-none fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4">
      {toasts.map((t) => {
        const cfg = variantConfig[t.variant] || variantConfig.default
        const Icon = cfg.icon
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-in slide-in-from-right-5 fade-in',
              cfg.classes,
            )}
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', iconColor[t.variant] || iconColor.default)} />
            <div className="flex-1">
              {t.title && <p className="text-sm font-semibold">{t.title}</p>}
              {t.description && (
                <p className="text-sm text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="opacity-60 transition-opacity hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
