import type { UserRole } from "@/features/auth/types"

export interface UserItemResponse {
  id: string
  company_id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  must_change_password: boolean
  designation?: string | null
  department?: string | null
  created_at: string
}

export interface UserDetailResponse {
  id: string
  company_id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  must_change_password: boolean
  phone?: string | null
  date_of_birth?: string | null
  address?: string | null
  designation?: string | null
  department?: string | null
  joined_on?: string | null
  created_by?: string | null
  created_at: string
}

export interface CreateUserRequest {
  full_name: string
  email: string
  role: "hr" | "employee"
}

export interface CreateUserResponse extends UserDetailResponse {
  temporary_password: string
}

export interface UserStatusUpdateRequest {
  is_active: boolean
}

export interface UserListResponse {
  items: UserItemResponse[]
  total: number
  page: number
  page_size: number
}

export interface UserListParams {
  page?: number
  page_size?: number
  role?: string
  search?: string
  is_active?: boolean
}
