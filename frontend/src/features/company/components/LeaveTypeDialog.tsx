import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { leaveTypeSchema, type LeaveTypeFormData } from "../schemas"
import { useCreateLeaveType } from "../hooks/useCreateLeaveType"
import { useUpdateLeaveType } from "../hooks/useUpdateLeaveType"
import type { LeaveTypeResponse } from "../types"
import { getErrorMessage } from "@/lib/apiError"

export interface LeaveTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: LeaveTypeResponse | null
}

export const LeaveTypeDialog: React.FC<LeaveTypeDialogProps> = ({
  open,
  onOpenChange,
  initialData,
}) => {
  const isEditing = Boolean(initialData)
  const createMutation = useCreateLeaveType()
  const updateMutation = useUpdateLeaveType()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      days_allowed: 10,
    },
  })

  useEffect(() => {
    if (open) {
      setServerError(null)
      if (initialData) {
        reset({
          name: initialData.name,
          days_allowed: initialData.days_allowed,
        })
      } else {
        reset({
          name: "",
          days_allowed: 10,
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: LeaveTypeFormData) => {
    setServerError(null)
    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: { name: data.name, days_allowed: data.days_allowed },
        })
        toast.success("Leave type updated")
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          days_allowed: data.days_allowed,
        })
        toast.success("Leave type added")
      }
      onOpenChange(false)
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save leave type")
      setServerError(msg)
    }
  }

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && onOpenChange(val)}>
      <DialogContent className="max-w-[420px] rounded-panel border-border bg-surface p-6 shadow-float">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-base font-semibold text-foreground">
            {isEditing ? "Edit leave type" : "Add leave type"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure the annual allowance and name for this category.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="rounded-control border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="leave-type-name" className="text-xs font-medium text-foreground">
              Name *
            </Label>
            <Input
              id="leave-type-name"
              {...register("name")}
              hasError={Boolean(errors.name)}
              placeholder="e.g. Annual leave, Sick leave"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="leave-type-days" className="text-xs font-medium text-foreground">
              Days allowed per year *
            </Label>
            <Input
              id="leave-type-days"
              type="number"
              min={0}
              max={365}
              {...register("days_allowed")}
              hasError={Boolean(errors.days_allowed)}
              placeholder="10"
              className="mt-1 font-mono"
            />
            {errors.days_allowed && (
              <p className="mt-1 text-[13px] text-danger">{errors.days_allowed.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2 flex flex-row items-center justify-end gap-3 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Add leave type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
