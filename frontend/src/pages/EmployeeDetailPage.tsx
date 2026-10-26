import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Loader2, ShieldCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { USER_ROLES } from "@/features/auth/types"
import { useUser } from "@/features/employees/hooks/useUser"
import { useUpdateUserStatus } from "@/features/employees/hooks/useUpdateUserStatus"
import { UserAvatar } from "@/components/common/UserAvatar"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { ErrorState } from "@/components/common/ErrorState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/apiError"

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const currentUser = useAuthStore((state) => state.user)
  const isOwner = currentUser?.role === USER_ROLES.OWNER

  const { data: user, isLoading, isError, error, refetch } = useUser(id || "")
  const updateStatusMutation = useUpdateUserStatus()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleToggleStatus = async () => {
    if (!user) return
    const newStatus = !user.is_active
    try {
      await updateStatusMutation.mutateAsync({
        id: user.id,
        data: { is_active: newStatus },
      })
      toast.success(newStatus ? "Employee activated" : "Employee deactivated")
      setConfirmOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update employee status"))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="rounded-panel border border-border bg-surface p-6 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="space-y-4">
        <Link
          to="/employees"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to employees
        </Link>
        <div className="rounded-panel border border-border bg-surface p-6">
          <ErrorState
            message={getErrorMessage(error, "User not found or access denied.")}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  const detailFields = [
    { label: "Email address", value: user.email },
    { label: "Role", value: user.role.toUpperCase() },
    { label: "Designation", value: user.designation || "Not added" },
    { label: "Department", value: user.department || "Not added" },
    { label: "Phone number", value: user.phone || "Not added" },
    { label: "Joined on", value: user.joined_on || "Not added" },
    { label: "Date of birth", value: user.date_of_birth || "Not added" },
    { label: "Address", value: user.address || "Not added" },
  ]

  return (
    <div className="space-y-6">
      <Link
        to="/employees"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to employees
      </Link>

      {/* Header Profile card */}
      <div className="rounded-panel border border-border bg-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.full_name} size="lg" className="h-12 w-12 text-base" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                {user.full_name}
              </h1>
              <StatusBadge
                status={user.is_active ? "Active" : "Inactive"}
                variant={user.is_active ? "active" : "inactive"}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{user.email}</p>
          </div>
        </div>

        {isOwner && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={updateStatusMutation.isPending}
            className={user.is_active ? "text-danger hover:text-danger hover:bg-danger-soft border-border" : ""}
          >
            {updateStatusMutation.isPending && (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            )}
            {user.is_active ? (
              <>
                <UserX className="mr-1.5 h-3.5 w-3.5" />
                Deactivate employee
              </>
            ) : (
              <>
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Activate employee
              </>
            )}
          </Button>
        )}
      </div>

      {/* Details Grid */}
      <div className="rounded-panel border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Personal & employment details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {detailFields.map((field) => (
            <div key={field.label} className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {field.label}
              </span>
              <p className="text-xs font-medium text-foreground break-words">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Balance Section */}
      <div className="rounded-panel border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-foreground mb-2">Leave balance</h2>
        <p className="text-xs text-muted-foreground">
          Leave balances will appear here once leave requests are available.
        </p>
      </div>

      {isOwner && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={user.is_active ? "Deactivate employee" : "Activate employee"}
          description={
            user.is_active
              ? `Are you sure you want to deactivate ${user.full_name}? They will no longer be able to log in to the application.`
              : `Reactivate ${user.full_name}'s account so they can log in?`
          }
          confirmLabel={user.is_active ? "Deactivate" : "Activate"}
          destructive={user.is_active}
          loading={updateStatusMutation.isPending}
          onConfirm={handleToggleStatus}
        />
      )}
    </div>
  )
}
