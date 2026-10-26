import React from "react"
import { Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/features/auth/types"

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const user = useAuthStore((s) => s.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <h2 className="text-base font-semibold text-foreground">Access denied</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You do not have access to this section.
        </p>
      </div>
    )
  }

  return <Outlet />
}
