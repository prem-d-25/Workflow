/**
 * Token & Session storage helper.
 * Note: In production enterprise mode, the refresh token is stored exclusively
 * inside a secure HttpOnly cookie set by the backend server.
 * JavaScript CANNOT read or manipulate the refresh token, preventing XSS theft.
 * This storage module only caches the short-lived access token in sessionStorage
 * and optional user profile metadata in localStorage for instant UI hydration.
 */

const ACCESS_TOKEN_KEY = 'wf_access_token'
const USER_KEY = 'wf_user_session'

export const storage = {
  /**
   * Save the active access token in sessionStorage (cleared when browser tab closes).
   */
  setAccessToken(token) {
    if (!token) return
    try {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
    } catch {
      // Memory fallback
    }
  },

  /**
   * Retrieve active access token.
   */
  getAccessToken() {
    try {
      return sessionStorage.getItem(ACCESS_TOKEN_KEY)
    } catch {
      return null
    }
  },

  /**
   * Remove active access token.
   */
  clearAccessToken() {
    try {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    } catch {
      // Memory fallback
    }
  },

  /**
   * Cache user profile for instant UI hydration before /me query resolves.
   */
  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(USER_KEY)
      }
    } catch {
      // Fallback
    }
  },

  /**
   * Retrieve cached user profile.
   */
  getUser() {
    try {
      const data = localStorage.getItem(USER_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  /**
   * Clear all JavaScript-accessible session data upon logout.
   */
  clearAll() {
    this.clearAccessToken()
    try {
      localStorage.removeItem(USER_KEY)
      sessionStorage.clear()
    } catch {
      // Fallback
    }
  },
}
