import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export const ProtectedRoute: React.FC = () => {
  const status = useAuthStore((s) => s.status)

  if (status === "loading") {
    return null
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
