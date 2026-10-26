import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { authApi } from "@/api/authApi"
import { useAuthStore } from "@/store/authStore"
import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, clearSession } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authApi.logout()
    } catch {
      // Ignore network errors during logout
    } finally {
      clearSession()
      toast.success("Logged out")
      navigate("/login")
    }
  }

  const roleLabels: Record<string, string> = {
    owner: "Owner",
    hr: "HR",
    employee: "Employee",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1080px] p-6">
        <PageHeader
          title={`Welcome, ${user?.full_name || "User"}`}
          description="Your workspace overview and profile status."
          action={
            <Button
              variant="secondary"
              onClick={handleLogout}
              isLoading={isLoggingOut}
            >
              Log out
            </Button>
          }
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-medium text-muted-foreground">Account Role</h2>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge
                  status={roleLabels[user?.role || ""] || user?.role || "Unknown"}
                  variant="neutral"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-medium text-muted-foreground">Email Address</h2>
              <p className="mt-2 text-sm font-medium text-foreground">
                {user?.email || "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
