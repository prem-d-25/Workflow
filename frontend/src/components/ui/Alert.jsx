import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertStyles = {
  error: {
    container: 'bg-rose-950/30 border-rose-800/60 text-rose-300',
    icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    titleColor: 'text-rose-200',
  },
  warning: {
    container: 'bg-amber-950/30 border-amber-800/60 text-amber-300',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    titleColor: 'text-amber-200',
  },
  success: {
    container: 'bg-teal-950/30 border-teal-800/60 text-teal-300',
    icon: <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />,
    titleColor: 'text-teal-200',
  },
  info: {
    container: 'bg-slate-800/60 border-slate-700 text-slate-300',
    icon: <Info className="w-5 h-5 text-teal-400 flex-shrink-0" />,
    titleColor: 'text-slate-100',
  },
}

export function Alert({
  type = 'error',
  title,
  message,
  fieldErrors = [],
  onClose,
  className,
  children,
}) {
  const style = alertStyles[type] || alertStyles.error

  return (
    <div
      role="alert"
      className={cn(
        'w-full p-4 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed transition-all shadow-md',
        style.container,
        className
      )}
    >
      <div className="pt-0.5">{style.icon}</div>

      <div className="flex-1 min-w-0">
        {title && <h4 className={cn('font-bold text-sm mb-1', style.titleColor)}>{title}</h4>}

        {message && <p>{message}</p>}

        {fieldErrors && fieldErrors.length > 0 && (
          <ul className="mt-2 list-disc list-inside space-y-0.5 text-[11px] opacity-90">
            {fieldErrors.map((err, idx) => (
              <li key={idx}>
                <strong className="capitalize">{Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : 'field'}:</strong>{' '}
                {err.msg}
              </li>
            ))}
          </ul>
        )}

        {children}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 p-1 -mr-1 rounded-md transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
