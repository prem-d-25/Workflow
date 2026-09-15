import React from 'react'
import { cn } from '@/lib/utils'

export function Card({
  children,
  className,
  header,
  footer,
  glass = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl',
        glass
          ? 'bg-slate-800/80 backdrop-blur-md border-slate-700/80'
          : 'bg-slate-800 border-slate-700',
        className
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-slate-700/80 px-6 py-4 flex items-center justify-between">
          {header}
        </div>
      )}

      <div className="p-6">{children}</div>

      {footer && (
        <div className="border-t border-slate-700/80 px-6 py-4 bg-slate-900/40 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  )
}

export function StatCard({
  title,
  value,
  subtitle,
  icon = null,
  trend = null,
  color = 'orange', // 'orange' | 'teal' | 'indigo' | 'emerald'
  className,
}) {
  const colorMap = {
    orange: {
      iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      accentGlow: 'hover:border-orange-500/40',
    },
    teal: {
      iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      accentGlow: 'hover:border-teal-500/40',
    },
    indigo: {
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      accentGlow: 'hover:border-indigo-500/40',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      accentGlow: 'hover:border-emerald-500/40',
    },
  }

  const selected = colorMap[color] || colorMap.orange

  return (
    <div
      className={cn(
        'bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all group',
        selected.accentGlow,
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              'w-9 h-9 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105',
              selected.iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-400">
            {trend && <span className="font-medium text-teal-400">{trend}</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
