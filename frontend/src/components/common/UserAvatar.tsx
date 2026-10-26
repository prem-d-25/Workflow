import React from "react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  className,
  size = "md",
}) => {
  const getInitials = (text: string): string => {
    const parts = text.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-medium text-accent select-none",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}
