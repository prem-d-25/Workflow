import { apiClient } from "./client"
import type { CompanyResponse, CompanyUpdateRequest } from "@/features/company/types"

export const getCompany = async (): Promise<CompanyResponse> => {
  const response = await apiClient.get<CompanyResponse>("/api/company")
  return response.data
}

export const updateCompany = async (
  data: CompanyUpdateRequest
): Promise<CompanyResponse> => {
  const response = await apiClient.put<CompanyResponse>("/api/company", data)
  return response.data
}
