import React, { useState } from "react"
import { Plus } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { USER_ROLES } from "@/features/auth/types"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { EmployeesFilters } from "@/features/employees/components/EmployeesFilters"
import { EmployeesTable } from "@/features/employees/components/EmployeesTable"
import { AddEmployeeDialog } from "@/features/employees/components/AddEmployeeDialog"
import { TemporaryPasswordDialog } from "@/features/employees/components/TemporaryPasswordDialog"

export const EmployeesPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const isOwner = user?.role === USER_ROLES.OWNER

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [createdTempInfo, setCreatedTempInfo] = useState<{
    email: string
    password: string
  } | null>(null)

  const handleEmployeeCreated = (data: {
    email: string
    temporaryPassword: string
  }) => {
    setCreatedTempInfo({
      email: data.email,
      password: data.temporaryPassword,
    })
  }

  const handleTempDialogChange = (open: boolean) => {
    if (!open) {
      setCreatedTempInfo(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="View organizational directory, track team members and manage access."
        action={
          isOwner ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add employee
            </Button>
          ) : undefined
        }
      />

      <EmployeesFilters />

      <EmployeesTable
        isOwner={isOwner}
        onOpenAdd={() => setAddDialogOpen(true)}
      />

      {isOwner && (
        <>
          <AddEmployeeDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onSuccess={handleEmployeeCreated}
          />

          <TemporaryPasswordDialog
            open={Boolean(createdTempInfo)}
            onOpenChange={handleTempDialogChange}
            email={createdTempInfo?.email || ""}
            password={createdTempInfo?.password || ""}
          />
        </>
      )}
    </div>
  )
}
