import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-slate-800/80 border border-slate-700/50', className)}
      {...props}
    />
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="w-full space-y-3">
      {/* Header skeleton */}
      <div className="grid grid-cols-4 gap-4 p-3 bg-slate-800/40 rounded-lg">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-3/4" />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-4 gap-4 p-3.5 bg-slate-850 rounded-lg border border-slate-800">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}
