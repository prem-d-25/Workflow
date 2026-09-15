import { apiClient } from '@/api/client'

export const companyApi = {
  async getCompany() {
    const response = await apiClient.get('/company')
    return response.data
  },

  async updateCompany(data) {
    const response = await apiClient.patch('/company', data)
    return response.data
  },
}
