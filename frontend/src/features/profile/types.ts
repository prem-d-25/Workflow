export interface ProfileResponse {
  id: string
  email: string
  full_name: string
  role: string
  phone: string | null
  date_of_birth: string | null
  address: string | null
  designation: string | null
  department: string | null
  joined_on: string | null
  company_name: string
}

export interface ProfileUpdateRequest {
  full_name: string
  phone?: string | null
  date_of_birth?: string | null
  address?: string | null
  designation?: string | null
  department?: string | null
  joined_on?: string | null
}
