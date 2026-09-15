import { apiClient } from '@/api/client'

export const announcementsApi = {
  async listAnnouncements(params = {}) {
    const response = await apiClient.get('/announcements', { params })
    return response.data
  },

  async createAnnouncement(data) {
    const response = await apiClient.post('/announcements', data)
    return response.data
  },

  async updateAnnouncement(id, data) {
    const response = await apiClient.patch(`/announcements/${id}`, data)
    return response.data
  },

  async deleteAnnouncement(id) {
    const response = await apiClient.delete(`/announcements/${id}`)
    return response.data
  },
}
