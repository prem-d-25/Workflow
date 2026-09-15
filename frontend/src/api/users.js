import { apiClient } from '@/api/client'

export const usersApi = {
  async listUsers(params = {}) {
    const response = await apiClient.get('/users', { params })
    return response.data
  },

  async createUser(data) {
    const response = await apiClient.post('/users', data)
    return response.data
  },

  async toggleStatus(userId, isActive) {
    const response = await apiClient.patch(`/users/${userId}/status`, { is_active: isActive })
    return response.data
  },
}
