import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ size = 'md', className, color = 'orange' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colorClasses = {
    orange: 'text-orange-500',
    teal: 'text-teal-400',
    white: 'text-white',
    slate: 'text-slate-400',
  }

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size] || sizeClasses.md,
        colorClasses[color] || colorClasses.orange,
        className
      )}
    />
  )
}
