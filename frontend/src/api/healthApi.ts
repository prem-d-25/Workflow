import { apiClient } from "./client"

export interface HealthStatus {
  status: string
  database: string
  vector: string
}

export const getHealth = async (): Promise<HealthStatus> => {
  const response = await apiClient.get<HealthStatus>("/api/health")
  return response.data
}
