import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    company_name: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .max(100, "Company name cannot exceed 100 characters"),
    full_name: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(100, "Full name cannot exceed 100 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .refine(
        (val) => new TextEncoder().encode(val).length <= 72,
        "Password cannot exceed 72 bytes"
      ),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
