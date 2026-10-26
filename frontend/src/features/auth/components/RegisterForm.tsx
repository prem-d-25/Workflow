import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"

import { authApi } from "@/api/authApi"
import { useAuthStore } from "@/store/authStore"
import { registerSchema, type RegisterFormData } from "@/features/auth/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      company_name: "",
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)
    setIsLoading(true)
    try {
      const response = await authApi.register({
        company_name: data.company_name,
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      })
      setSession(response.user, response.access_token)
      navigate("/")
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setServerError(String(err.response.data.detail))
      } else {
        setServerError("Unable to create account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-[420px]">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-base font-semibold">Create your company account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
          {serverError && (
            <div className="rounded-control bg-danger-soft p-3 text-[13px] text-danger">
              {serverError}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="company_name">Company name</Label>
            <Input
              id="company_name"
              placeholder="Acme Corp"
              hasError={!!errors.company_name}
              {...register("company_name")}
            />
            {errors.company_name && (
              <p className="text-[13px] text-danger">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              placeholder="Jane Doe"
              hasError={!!errors.full_name}
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="text-[13px] text-danger">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              hasError={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[13px] text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hasError={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[13px] text-danger">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              hasError={!!errors.confirm_password}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-[13px] text-danger">{errors.confirm_password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Create account
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
