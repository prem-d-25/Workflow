export interface CompanyResponse {
  id: string
  name: string
  address: string | null
  phone: string | null
  website: string | null
  industry: string | null
  size: string | null
  created_at: string
  updated_at: string
}

export interface CompanyUpdateRequest {
  name: string
  address?: string | null
  phone?: string | null
  website?: string | null
  industry?: string | null
  size?: string | null
}

export interface LeaveTypeResponse {
  id: string
  company_id: string
  name: string
  days_allowed: number
  created_at: string
}

export interface LeaveTypeCreateRequest {
  name: string
  days_allowed: number
}

export interface LeaveTypeUpdateRequest {
  name: string
  days_allowed: number
}
