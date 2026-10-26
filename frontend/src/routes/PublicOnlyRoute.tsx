import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export const PublicOnlyRoute: React.FC = () => {
  const status = useAuthStore((s) => s.status)

  if (status === "loading") {
    return null
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
