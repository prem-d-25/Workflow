import React, { useEffect, useRef } from "react"
import { useAuthStore } from "@/store/authStore"
import { requestTokenRefresh } from "@/api/client"

interface AuthInitializerProps {
  children: React.ReactNode
}

/**
 * Restores session from the httpOnly cookie on initial application load.
 * Displays a minimal centered loading state while verifying auth status.
 */
export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const status = useAuthStore((s) => s.status)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    requestTokenRefresh().catch(() => {
      useAuthStore.getState().clearSession()
    })
  }, [])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
