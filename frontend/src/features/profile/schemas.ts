import { z } from "zod"

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name cannot exceed 100 characters"),
  phone: z.string().max(20, "Phone number cannot exceed 20 characters").optional().nullable(),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true
        const parsed = new Date(val)
        if (isNaN(parsed.getTime())) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return parsed < today
      },
      { message: "Date of birth must be in the past" }
    ),
  address: z.string().max(255, "Address cannot exceed 255 characters").optional().nullable(),
  designation: z.string().max(100, "Designation cannot exceed 100 characters").optional().nullable(),
  department: z.string().max(100, "Department cannot exceed 100 characters").optional().nullable(),
  joined_on: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true
        const parsed = new Date(val)
        if (isNaN(parsed.getTime())) return false
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        return parsed <= today
      },
      { message: "Joined on date cannot be in the future" }
    ),
})

export type ProfileFormData = z.infer<typeof profileSchema>
