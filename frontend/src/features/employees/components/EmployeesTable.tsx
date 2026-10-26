import React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useUsers } from "../hooks/useUsers"
import { UserAvatar } from "@/components/common/UserAvatar"
import { StatusBadge } from "@/components/common/StatusBadge"
import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState } from "@/components/common/ErrorState"
import { EmployeesPagination } from "./EmployeesPagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/apiError"

export interface EmployeesTableProps {
  isOwner: boolean
  onOpenAdd?: () => void
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  isOwner,
  onOpenAdd,
}) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get("page") || "1", 10)
  const search = searchParams.get("search") || undefined
  const role = searchParams.get("role") || undefined
  const statusParam = searchParams.get("status")

  const isActive =
    statusParam === "active" ? true : statusParam === "inactive" ? false : undefined

  const { data, isLoading, isError, error, refetch } = useUsers({
    page,
    page_size: 10,
    search,
    role,
    is_active: isActive,
  })

  const hasActiveFilters = Boolean(search || role || statusParam)

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("page", newPage.toString())
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-panel border border-border bg-surface p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-panel border border-border bg-surface p-6">
        <ErrorState
          message={getErrorMessage(error, "Failed to load employees.")}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const items = data?.items || []
  const total = data?.total || 0

  if (items.length === 0) {
    return (
      <div className="rounded-panel border border-border bg-surface">
        {hasActiveFilters ? (
          <EmptyState message="No employees match your filters" />
        ) : (
          <EmptyState
            message="No employees yet"
            description="Add your first team member to start managing permissions and leave."
            actionLabel={isOwner ? "Add employee" : undefined}
            onAction={isOwner ? onOpenAdd : undefined}
          />
        )}
      </div>
    )
  }

  return (
    <div className="rounded-panel border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground py-3">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-3">
                Role
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-3">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((emp) => (
              <TableRow
                key={emp.id}
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={emp.full_name} size="md" />
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        {emp.full_name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {emp.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground capitalize">
                    {emp.role}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  <StatusBadge
                    status={emp.is_active ? "Active" : "Inactive"}
                    variant={emp.is_active ? "active" : "inactive"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EmployeesPagination
        page={page}
        total={total}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
