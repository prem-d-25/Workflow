import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusVariant = "pending" | "approved" | "rejected" | "active" | "inactive" | "neutral"

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
}

const variantStyles: Record<StatusVariant, string> = {
  pending: "bg-warning-soft text-warning",
  approved: "bg-success-soft text-success",
  active: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-danger",
  inactive: "bg-muted text-muted-foreground",
  neutral: "bg-muted text-foreground",
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = "neutral",
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {status}
    </span>
  )
}
