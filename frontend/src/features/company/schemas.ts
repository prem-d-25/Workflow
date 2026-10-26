import { z } from "zod"

export const companyDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name cannot exceed 100 characters"),
  address: z.string().max(255, "Address cannot exceed 255 characters").optional().nullable(),
  phone: z.string().max(50, "Phone cannot exceed 50 characters").optional().nullable(),
  website: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: "Please enter a valid website URL (e.g. https://example.com)" }
    ),
  industry: z.string().max(100, "Industry cannot exceed 100 characters").optional().nullable(),
  size: z.string().max(50, "Size cannot exceed 50 characters").optional().nullable(),
})

export type CompanyDetailsFormData = z.infer<typeof companyDetailsSchema>

export const leaveTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Leave type name is required")
    .max(50, "Leave type name cannot exceed 50 characters"),
  days_allowed: z.coerce
    .number({ invalid_type_error: "Days allowed must be a number" })
    .int("Days allowed must be a whole number")
    .min(0, "Days allowed cannot be negative")
    .max(365, "Days allowed cannot exceed 365 days"),
})

export type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>
