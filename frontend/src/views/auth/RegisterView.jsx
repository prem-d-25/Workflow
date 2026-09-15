import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building, Lock, Mail, Sparkles, UserCheck } from 'lucide-react'
import { Alert, Button, Input } from '@/components/ui'
import { registerCompanySchema } from '@/lib/validations'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { AuthLayout } from '@/views/auth/AuthLayout'

export function RegisterView() {
  const navigate = useNavigate()
  const registerCompany = useAuthStore((state) => state.registerCompany)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const [apiError, setApiError] = useState(null)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isInitialized, isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      company_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (data) => {
    setApiError(null)
    try {
      await registerCompany({
        company_name: data.company_name,
        email: data.email,
        password: data.password,
      })
      toast.success(
        `Welcome to Workflow! Workspace "${data.company_name}" created with default leave quotas.`,
        'Registration Successful'
      )
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.friendlyMessage || 'Failed to register company workspace.')
    }
  }

  return (
    <AuthLayout
      title="Create Tenant Workspace"
      subtitle="Register your company to initialize default quotas & provision owner access."
    >
      {apiError && (
        <Alert
          type="error"
          title="Registration Error"
          message={apiError}
          onClose={() => setApiError(null)}
          className="mb-5"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {/* Company Name */}
        <Input
          label="Company / Organization Name"
          placeholder="e.g. Acme Technologies"
          required
          leftIcon={<Building className="w-4 h-4" />}
          {...register('company_name')}
          error={errors.company_name?.message}
        />

        {/* Corporate Email */}
        <Input
          label="Owner Corporate Email"
          type="email"
          placeholder="owner@company.com"
          required
          leftIcon={<Mail className="w-4 h-4" />}
          {...register('email')}
          error={errors.email?.message}
          helperText="Will be registered as primary company OWNER."
        />

        {/* Password */}
        <Input
          label="Account Password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          {...register('password')}
          error={errors.password?.message}
          helperText="Minimum 6 characters."
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Create Workspace &amp; Sign In
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-4 border-t border-slate-700/80 text-center text-xs text-slate-400">
        Already have a company account?{' '}
        <Link
          to="/login"
          className="text-orange-400 hover:text-orange-300 font-semibold hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </AuthLayout>
  )
}
