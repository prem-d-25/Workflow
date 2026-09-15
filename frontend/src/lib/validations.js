import { z } from 'zod'

/**
 * Returns today's date in YYYY-MM-DD local format
 */
export function getTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns date 5 days from today in YYYY-MM-DD format (for Planned Leaves)
 */
export function getPlannedMinDateString(days = 5) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Zod validation schema for Leave Requests adhering to agent.md rules:
 * 1. No past dates allowed for any leave type.
 * 2. End date must be on or after start date.
 * 3. Planned leaves strictly enforce >= 5 days advance notice window.
 */
export const leaveRequestSchema = z
  .object({
    leave_type: z.enum(['PLANNED', 'SICK', 'CASUAL', 'UNPAID'], {
      errorMap: () => ({ message: 'Please select a valid leave category.' }),
    }),
    start_date: z.string().min(1, 'Start date is required.'),
    end_date: z.string().min(1, 'End date is required.'),
    reason: z
      .string()
      .min(5, 'Please provide a reason (minimum 5 characters).')
      .max(1000, 'Reason cannot exceed 1000 characters.'),
  })
  .superRefine((data, ctx) => {
    const today = getTodayString()

    // Rule 1: No past dates
    if (data.start_date && data.start_date < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['start_date'],
        message: `Past dates are not allowed. Earliest selectable date is today (${today}).`,
      })
    }

    // Rule 2: End date must not be before start date
    if (data.start_date && data.end_date && data.end_date < data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'End date must be on or after the start date.',
      })
    }

    // Rule 3: Planned leave 5-day advance notice window (agent.md Section 5)
    if (data.leave_type === 'PLANNED' && data.start_date) {
      const minPlanned = getPlannedMinDateString(5)
      if (data.start_date < minPlanned) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['start_date'],
          message: `Planned vacation requires at least 5 days advance notice (Earliest allowed: ${minPlanned}).`,
        })
      }
    }
  })

/**
 * Zod validation schema for Company Registration & Owner Onboarding
 */
export const registerCompanySchema = z
  .object({
    company_name: z
      .string()
      .min(2, 'Company name must be at least 2 characters.')
      .max(255, 'Company name is too long.'),
    email: z
      .string()
      .email('Please enter a valid corporate email address.')
      .min(1, 'Email is required.'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters.')
      .max(72, 'Password cannot exceed 72 characters.'),
    confirm_password: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  })

/**
 * Zod validation schema for User Login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid corporate email address.')
    .min(1, 'Email is required.'),
  password: z.string().min(1, 'Password is required.'),
})

/**
 * Zod validation schema for First-Login Mandatory Password Reset
 */
export const resetPasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current or temporary password is required.'),
    new_password: z
      .string()
      .min(6, 'New password must be at least 6 characters.')
      .max(72, 'Password cannot exceed 72 characters.'),
    confirm_password: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: 'New password must be different from your current temporary password.',
    path: ['new_password'],
  })

