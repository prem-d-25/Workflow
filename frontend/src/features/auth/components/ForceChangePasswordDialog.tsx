import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import { authApi } from "@/api/authApi"
import { useAuthStore, useMustChangePassword } from "@/store/authStore"
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/features/auth/schemas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const ForceChangePasswordDialog: React.FC = () => {
  const navigate = useNavigate()
  const mustChangePassword = useMustChangePassword()
  const { updateUser, clearSession } = useAuthStore()

  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setServerError(null)
    setIsLoading(true)
    try {
      await authApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })
      updateUser({ must_change_password: false })
      toast.success("Password changed")
      reset()
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setServerError(String(err.response.data.detail))
      } else {
        setServerError("Unable to change password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore network errors on logout
    } finally {
      clearSession()
      toast.success("Logged out")
      navigate("/login")
    }
  }

  if (!mustChangePassword) return null

  return (
    <Dialog open={mustChangePassword}>
      <DialogContent
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-full max-w-[420px]"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold">Change your password</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            You are using a temporary password. Choose a new one to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5 pt-2">
          {serverError && (
            <div className="rounded-control bg-danger-soft p-3 text-[13px] text-danger">
              {serverError}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="current_password">Current password</Label>
            <Input
              id="current_password"
              type="password"
              autoComplete="current-password"
              hasError={!!errors.current_password}
              {...register("current_password")}
            />
            {errors.current_password && (
              <p className="text-[13px] text-danger">{errors.current_password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hasError={!!errors.new_password}
              {...register("new_password")}
            />
            {errors.new_password && (
              <p className="text-[13px] text-danger">{errors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm_new_password">Confirm new password</Label>
            <Input
              id="confirm_new_password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              hasError={!!errors.confirm_password}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-[13px] text-danger">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-danger hover:underline focus:outline-none"
            >
              Log out
            </button>
            <Button type="submit" isLoading={isLoading}>
              Set new password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
