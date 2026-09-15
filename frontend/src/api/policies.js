import { apiClient } from '@/api/client'

export const policiesApi = {
  async listPolicies() {
    const response = await apiClient.get('/policies')
    return response.data
  },

  async uploadPolicyFile(file, documentName = null) {
    const formData = new FormData()
    formData.append('file', file)
    if (documentName) {
      formData.append('document_name', documentName)
    }
    const response = await apiClient.post('/policies/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async createPolicyText(data) {
    const response = await apiClient.post('/policies/text', data)
    return response.data
  },

  async deletePolicy(documentName) {
    const response = await apiClient.delete(`/policies/${encodeURIComponent(documentName)}`)
    return response.data
  },
}
