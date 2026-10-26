import { apiClient } from "./client"
import type {
  UserListResponse,
  UserListParams,
  UserDetailResponse,
  CreateUserRequest,
  CreateUserResponse,
  UserStatusUpdateRequest,
  UserItemResponse,
} from "@/features/employees/types"

export const getUsers = async (
  params?: UserListParams
): Promise<UserListResponse> => {
  const response = await apiClient.get<UserListResponse>("/api/users", {
    params,
  })
  return response.data
}

export const getUser = async (id: string): Promise<UserDetailResponse> => {
  const response = await apiClient.get<UserDetailResponse>(`/api/users/${id}`)
  return response.data
}

export const createUser = async (
  data: CreateUserRequest
): Promise<CreateUserResponse> => {
  const response = await apiClient.post<CreateUserResponse>("/api/users", data)
  return response.data
}

export const updateUserStatus = async (
  id: string,
  data: UserStatusUpdateRequest
): Promise<UserItemResponse> => {
  const response = await apiClient.patch<UserItemResponse>(
    `/api/users/${id}/status`,
    data
  )
  return response.data
}
