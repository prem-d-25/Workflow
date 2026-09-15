import React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FormField({
  label,
  error,
  helperText,
  required = false,
  children,
  className,
}) {
  return (
    <div className={cn('w-full space-y-1.5 text-left', className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label}
          {required && <span className="text-orange-400 ml-1">*</span>}
        </label>
      )}

      {children}

      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  )
}
