import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { Alert, Button, Input } from '@/components/ui'
import { loginSchema } from '@/lib/validations'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { AuthLayout } from '@/views/auth/AuthLayout'

export function LoginView() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const forcePasswordReset = useAuthStore((state) => state.forcePasswordReset)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const [apiError, setApiError] = useState(null)

  // If already authenticated, redirect to dashboard or reset-password
  React.useEffect(() => {
    if (isInitialized && isAuthenticated) {
      if (forcePasswordReset) {
        navigate('/reset-password', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isInitialized, isAuthenticated, forcePasswordReset, navigate])

  // Redirect destination after successful login
  const fromPath = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (credentials) => {
    setApiError(null)
    try {
      const data = await login(credentials)

      // Handle mandatory first-time password reset trigger (agent.md Section 5)
      if (data.force_password_reset) {
        toast.warning(
          'First-time login detected: You must update your temporary password before accessing features.',
          'Password Reset Required'
        )
        navigate('/reset-password')
        return
      }

      toast.success(`Welcome back, ${data.user.full_name || data.user.email}!`, 'Signed In')
      navigate(fromPath, { replace: true })
    } catch (err) {
      setApiError(err.friendlyMessage || 'Authentication failed. Please verify credentials.')
    }
  }

  return (
    <AuthLayout
      title="Sign In to Workflow"
      subtitle="Enter your corporate credentials to access your company workspace."
    >
      {apiError && (
        <Alert
          type="error"
          title="Sign In Failed"
          message={apiError}
          onClose={() => setApiError(null)}
          className="mb-5"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {/* Email */}
        <Input
          label="Corporate Email Address"
          type="email"
          placeholder="name@company.com"
          required
          leftIcon={<Mail className="w-4 h-4" />}
          {...register('email')}
          error={errors.email?.message}
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          {...register('password')}
          error={errors.password?.message}
          helperText="New employees: default password is first 3 letters of email + 1234."
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-4 border-t border-slate-700/80 text-center text-xs text-slate-400">
        New organization?{' '}
        <Link
          to="/register"
          className="text-orange-400 hover:text-orange-300 font-semibold hover:underline"
        >
          Register company workspace
        </Link>
      </div>
    </AuthLayout>
  )
}
