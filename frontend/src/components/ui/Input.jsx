import React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      id,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300">
            {label}
            {required && <span className="text-orange-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'w-full bg-slate-900 text-slate-100 text-sm rounded-lg px-3.5 py-2 border transition-all duration-150',
              'placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-700 hover:border-slate-600',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input'
