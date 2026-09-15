import React from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Select = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      className,
      id,
      required,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300">
            {label}
            {required && <span className="text-orange-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full bg-slate-900 text-slate-100 text-sm rounded-lg pl-3.5 pr-10 py-2 border transition-all duration-150 appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500',
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-700 hover:border-slate-600',
              className
            )}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

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
)

Select.displayName = 'Select'
