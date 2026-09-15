import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'

const toastIcons = {
  success: <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />,
}

const toastBorders = {
  success: 'border-teal-500/40 bg-slate-900/95 text-slate-100 shadow-teal-500/10',
  error: 'border-rose-500/40 bg-slate-900/95 text-slate-100 shadow-rose-500/10',
  warning: 'border-amber-500/40 bg-slate-900/95 text-slate-100 shadow-amber-500/10',
  info: 'border-blue-500/40 bg-slate-900/95 text-slate-100 shadow-blue-500/10',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start space-x-3 transition-all duration-200',
            'animate-in fade-in slide-in-from-top-4',
            toastBorders[toast.type] || toastBorders.info
          )}
        >
          <div className="pt-0.5">{toastIcons[toast.type] || toastIcons.info}</div>

          <div className="flex-1 min-w-0">
            {toast.title && (
              <h5 className="text-xs font-bold text-white mb-0.5">{toast.title}</h5>
            )}
            <p className="text-xs text-slate-300 leading-relaxed break-words">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 -mr-1 rounded-md transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
