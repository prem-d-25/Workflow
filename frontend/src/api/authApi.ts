import { apiClient } from "./client"
import type { User } from "@/features/auth/types"

export interface RegisterRequest {
  company_name: string
  full_name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface MessageResponse {
  message: string
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/api/auth/register", data)
    return response.data
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/api/auth/login", data)
    return response.data
  },

  refresh: async (): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/api/auth/refresh")
    return response.data
  },

  logout: async (): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>("/api/auth/logout")
    return response.data
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>("/api/auth/me")
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>("/api/auth/change-password", data)
    return response.data
  },
}
