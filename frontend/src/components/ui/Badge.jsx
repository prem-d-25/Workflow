import React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = {
  // Role Badges
  OWNER: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  HR: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  EMPLOYEE: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',

  // Status Badges
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  APPROVED: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  REJECTED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  DEACTIVATED: 'bg-slate-800 text-slate-400 border-slate-700',

  // Generic Design System Variants
  default: 'bg-slate-800 text-slate-300 border-slate-700',
  primary: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  teal: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  outline: 'bg-transparent text-slate-400 border-slate-700',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded',
    md: 'text-xs px-2.5 py-0.5 rounded-full',
    lg: 'text-sm px-3 py-1 rounded-full',
  }

  const selectedVariant = badgeVariants[variant] || badgeVariants.default

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider border select-none',
        selectedVariant,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  )
}
