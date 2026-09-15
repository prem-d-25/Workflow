import { apiClient } from '@/api/client'

export const authApi = {
  /**
   * Register a new company and owner account.
   * Sets HttpOnly refresh_token cookie on the browser.
   */
  async registerCompany(data) {
    const response = await apiClient.post('/auth/register-company', data)
    return response.data
  },

  /**
   * Login with corporate email and password.
   * Sets HttpOnly refresh_token cookie on the browser.
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Refresh the access token using the browser's HttpOnly refresh cookie.
   */
  async refreshToken() {
    const response = await apiClient.post('/auth/refresh', {})
    return response.data
  },

  /**
   * Logout user and instruct backend to delete the HttpOnly refresh cookie.
   */
  async logout() {
    const response = await apiClient.post('/auth/logout', {})
    return response.data
  },

  /**
   * Get currently authenticated user profile and company info.
   */
  async getMe() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  /**
   * Change user password (clearing force_password_reset flag).
   */
  async changePassword(data) {
    const response = await apiClient.post('/auth/change-password', data)
    return response.data
  },
}
