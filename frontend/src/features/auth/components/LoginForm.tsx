import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"

import { authApi } from "@/api/authApi"
import { useAuthStore } from "@/store/authStore"
import { loginSchema, type LoginFormData } from "@/features/auth/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    setIsLoading(true)
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      })
      setSession(response.user, response.access_token)
      navigate("/")
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setServerError(String(err.response.data.detail))
      } else {
        setServerError("Unable to sign in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-base font-semibold">Sign in to your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {serverError && (
            <div className="rounded-control bg-danger-soft p-3 text-[13px] text-danger">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              hasError={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[13px] text-danger">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
