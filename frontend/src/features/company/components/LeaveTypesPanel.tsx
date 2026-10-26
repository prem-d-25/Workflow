import React, { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useLeaveTypes } from "../hooks/useLeaveTypes"
import { useDeleteLeaveType } from "../hooks/useDeleteLeaveType"
import type { LeaveTypeResponse } from "../types"
import { LeaveTypeDialog } from "./LeaveTypeDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState } from "@/components/common/ErrorState"
import { Button } from "@/components/ui/button"
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

export const LeaveTypesPanel: React.FC = () => {
  const { data: leaveTypes, isLoading, isError, error, refetch } = useLeaveTypes()
  const deleteMutation = useDeleteLeaveType()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeResponse | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leaveTypeToDelete, setLeaveTypeToDelete] = useState<LeaveTypeResponse | null>(null)

  const handleOpenAdd = () => {
    setSelectedLeaveType(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (lt: LeaveTypeResponse) => {
    setSelectedLeaveType(lt)
    setDialogOpen(true)
  }

  const handleOpenDelete = (lt: LeaveTypeResponse) => {
    setLeaveTypeToDelete(lt)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!leaveTypeToDelete) return
    try {
      await deleteMutation.mutateAsync(leaveTypeToDelete.id)
      toast.success("Leave type deleted")
      setDeleteDialogOpen(false)
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to delete leave type")
      toast.error(msg)
    }
  }

  return (
    <div className="rounded-panel border border-border bg-surface p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Leave types</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define annual leave allowances available to employees.
          </p>
        </div>
        <Button type="button" size="sm" onClick={handleOpenAdd} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" />
          Add leave type
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          message={getErrorMessage(error, "Failed to load leave types.")}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && (!leaveTypes || leaveTypes.length === 0) && (
        <EmptyState
          message="No leave types yet. Add the types of leave your company allows, for example sick or paid leave."
          actionLabel="Add leave type"
          onAction={handleOpenAdd}
        />
      )}

      {!isLoading && !isError && leaveTypes && leaveTypes.length > 0 && (
        <div className="overflow-x-auto border border-border rounded-control">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="text-xs font-medium text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Days per year
                </TableHead>
                <TableHead className="w-[100px] text-right text-xs font-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.map((lt) => (
                <TableRow key={lt.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium text-foreground text-xs py-3.5">
                    {lt.name}
                  </TableCell>
                  <TableCell className="text-xs text-foreground py-3.5 font-mono">
                    {lt.days_allowed} {lt.days_allowed === 1 ? "day" : "days"}
                  </TableCell>
                  <TableCell className="text-right py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label={`Edit ${lt.name}`}
                        onClick={() => handleOpenEdit(lt)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-danger"
                        aria-label={`Delete ${lt.name}`}
                        onClick={() => handleOpenDelete(lt)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LeaveTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedLeaveType}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete leave type"
        description={`Are you sure you want to delete "${leaveTypeToDelete?.name}"? Employees will no longer be able to request this leave category.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
