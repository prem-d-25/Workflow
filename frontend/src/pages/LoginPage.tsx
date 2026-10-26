import React from "react"
import { LoginForm } from "@/features/auth/components/LoginForm"

export const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Workflow</h1>
      </div>
      <LoginForm />
    </div>
  )
}
