/**
 * Authentication and authorization types.
 */

export const USER_ROLES = {
  OWNER: "owner",
  HR: "hr",
  EMPLOYEE: "employee",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export interface User {
  id: string
  company_id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  must_change_password: boolean
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"
