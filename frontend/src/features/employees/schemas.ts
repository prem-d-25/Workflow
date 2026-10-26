import { z } from "zod"

export const addUserSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["hr", "employee"], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
})

export type AddUserFormData = z.infer<typeof addUserSchema>
