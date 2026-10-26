import React from "react"
import { useAuthStore } from "@/store/authStore"
import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"

const roleLabels: Record<string, string> = {
  owner: "Owner",
  hr: "HR",
  employee: "Employee",
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name || "User"}`}
        description="Your workspace overview and profile status."
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
  )
}
