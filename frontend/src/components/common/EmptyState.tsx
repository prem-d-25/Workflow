import React from "react"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  message: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: LucideIcon
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center sm:p-12 ${className}`}
    >
      {Icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-control bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="max-w-md text-sm font-medium text-foreground">{message}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          type="button"
          size="sm"
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
