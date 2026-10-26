import { apiClient } from "./client"
import type {
  LeaveTypeResponse,
  LeaveTypeCreateRequest,
  LeaveTypeUpdateRequest,
} from "@/features/company/types"

export const getLeaveTypes = async (): Promise<LeaveTypeResponse[]> => {
  const response = await apiClient.get<LeaveTypeResponse[]>("/api/leave-types")
  return response.data
}

export const createLeaveType = async (
  data: LeaveTypeCreateRequest
): Promise<LeaveTypeResponse> => {
  const response = await apiClient.post<LeaveTypeResponse>("/api/leave-types", data)
  return response.data
}

export const updateLeaveType = async (
  id: string,
  data: LeaveTypeUpdateRequest
): Promise<LeaveTypeResponse> => {
  const response = await apiClient.put<LeaveTypeResponse>(`/api/leave-types/${id}`, data)
  return response.data
}

export const deleteLeaveType = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/leave-types/${id}`)
}
