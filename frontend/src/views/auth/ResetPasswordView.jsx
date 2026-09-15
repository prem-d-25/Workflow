import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Lock, ShieldAlert, Sparkles } from 'lucide-react'
import { Alert, Button, Input } from '@/components/ui'
import { resetPasswordSchema } from '@/lib/validations'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { AuthLayout } from '@/views/auth/AuthLayout'

export function ResetPasswordView() {
  const navigate = useNavigate()
  const changePassword = useAuthStore((state) => state.changePassword)
  const user = useAuthStore((state) => state.user)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (data) => {
    setApiError(null)
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })

      toast.success(
        'Password updated successfully! Your account is now fully activated.',
        'Security Setup Complete'
      )
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.friendlyMessage || 'Failed to update password. Verify your current temporary password.')
    }
  }

  return (
    <AuthLayout
      title="Set Permanent Password"
      subtitle={`Welcome ${user?.email || ''}! You are logging in with a temporary password and must set a new secure password before continuing.`}
    >
      <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Security Policy (agent.md):</strong> All newly provisioned team members must replace their auto-generated temporary password upon first authentication.
        </span>
      </div>

      {apiError && (
        <Alert
          type="error"
          title="Password Reset Failed"
          message={apiError}
          onClose={() => setApiError(null)}
          className="mb-5"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {/* Current / Temporary Password */}
        <Input
          label="Current Temporary Password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<KeyRound className="w-4 h-4" />}
          {...register('current_password')}
          error={errors.current_password?.message}
          helperText="The auto-generated password you used to log in."
        />

        {/* New Password */}
        <Input
          label="New Permanent Password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          {...register('new_password')}
          error={errors.new_password?.message}
          helperText="Must be at least 6 characters and different from temporary password."
        />

        {/* Confirm New Password */}
        <Input
          label="Confirm New Permanent Password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Activate Account &amp; Enter Dashboard
        </Button>
      </form>
    </AuthLayout>
  )
}
