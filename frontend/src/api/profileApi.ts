import { apiClient } from "./client"
import type { ProfileResponse, ProfileUpdateRequest } from "@/features/profile/types"

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>("/api/users/me/profile")
  return response.data
}

export const updateProfile = async (
  data: ProfileUpdateRequest
): Promise<ProfileResponse> => {
  const response = await apiClient.put<ProfileResponse>("/api/users/me/profile", data)
  return response.data
}
