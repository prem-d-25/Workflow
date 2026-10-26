import React from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Failed to load data.",
  onRetry,
  retryLabel = "Try again",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center sm:p-12 ${className}`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-control bg-danger-soft text-danger">
        <AlertCircle className="h-5 w-5" />
      </div>
      <p className="max-w-md text-sm font-medium text-foreground">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
