import { apiClient } from '@/api/client'

export const leavesApi = {
  async getMyBalance() {
    const response = await apiClient.get('/leaves/balance')
    return response.data
  },

  async getMyLeaves() {
    const response = await apiClient.get('/leaves/my')
    return response.data
  },

  async applyLeave(data) {
    const response = await apiClient.post('/leaves', data)
    return response.data
  },

  async listReviewLeaves(params = {}) {
    const response = await apiClient.get('/leaves/review', { params })
    return response.data
  },

  async reviewLeave(leaveId, status) {
    const response = await apiClient.patch(`/leaves/${leaveId}/review`, { status })
    return response.data
  },
}
