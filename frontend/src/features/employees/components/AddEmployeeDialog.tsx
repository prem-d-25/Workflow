import React, { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addUserSchema, type AddUserFormData } from "../schemas"
import { useCreateUser } from "../hooks/useCreateUser"
import { getErrorMessage } from "@/lib/apiError"

export interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: { email: string; temporaryPassword: string }) => void
}

export const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const createMutation = useCreateUser()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      full_name: "",
      email: "",
      role: "employee",
    },
  })

  useEffect(() => {
    if (open) {
      setServerError(null)
      reset({
        full_name: "",
        email: "",
        role: "employee",
      })
    }
  }, [open, reset])

  const onSubmit = async (data: AddUserFormData) => {
    setServerError(null)
    try {
      const response = await createMutation.mutateAsync({
        full_name: data.full_name,
        email: data.email,
        role: data.role,
      })
      toast.success("Employee added")
      onOpenChange(false)
      onSuccess({
        email: response.email,
        temporaryPassword: response.temporary_password,
      })
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create employee")
      setServerError(msg)
    }
  }

  const isSaving = isSubmitting || createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && onOpenChange(val)}>
      <DialogContent className="max-w-[440px] rounded-panel border-border bg-surface p-6 shadow-float">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-base font-semibold text-foreground">
            Add employee
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Send an account invitation with a system-generated temporary password.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="rounded-control border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="employee-full-name" className="text-xs font-medium text-foreground">
              Full name *
            </Label>
            <Input
              id="employee-full-name"
              {...register("full_name")}
              hasError={Boolean(errors.full_name)}
              placeholder="e.g. Jane Doe"
              className="mt-1"
            />
            {errors.full_name && (
              <p className="mt-1 text-[13px] text-danger">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="employee-email" className="text-xs font-medium text-foreground">
              Email address *
            </Label>
            <Input
              id="employee-email"
              type="email"
              {...register("email")}
              hasError={Boolean(errors.email)}
              placeholder="jane@company.com"
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-[13px] text-danger">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="employee-role" className="text-xs font-medium text-foreground">
              Role *
            </Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="employee-role" className="mt-1 h-9 text-xs">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="mt-1 text-[13px] text-danger">{errors.role.message}</p>
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
              Add employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
