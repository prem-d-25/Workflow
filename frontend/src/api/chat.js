import { apiClient } from '@/api/client'

export const chatApi = {
  async askChatbot({ question, history = [] }) {
    const response = await apiClient.post('/chat', { question, history })
    return response.data
  },
}
