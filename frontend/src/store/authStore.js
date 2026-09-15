import { create } from 'zustand'
import { authApi } from '@/api/auth'
import { storage } from '@/lib/storage'

export const useAuthStore = create((set, get) => ({
  user: storage.getUser(),
  company: null,
  accessToken: storage.getAccessToken(),
  isAuthenticated: Boolean(storage.getAccessToken() || storage.getUser()),
  forcePasswordReset: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Hydrate auth state on application startup.
   * If an access token exists, verifies it via /me.
   * If missing or expired, the Axios interceptor automatically uses the browser's
   * HttpOnly refresh cookie to acquire a fresh access token without user disruption.
   */
  initialize: async () => {
    set({ isLoading: true })
    try {
      const meData = await authApi.getMe()
      storage.setUser(meData.user)

      set({
        user: meData.user,
        company: meData.company,
        isAuthenticated: true,
        forcePasswordReset: Boolean(meData.user.force_password_reset),
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    } catch {
      // If /me and refresh cookie fail, clear state
      storage.clearAll()
      set({
        user: null,
        company: null,
        accessToken: null,
        isAuthenticated: false,
        forcePasswordReset: false,
        isLoading: false,
        isInitialized: true,
      })
    }
  },

  /**
   * User login with corporate credentials.
   * Server sets the secure HttpOnly refresh cookie; client receives access token.
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authApi.login(credentials)

      storage.setAccessToken(data.access_token)
      storage.setUser(data.user)

      set({
        user: data.user,
        accessToken: data.access_token,
        isAuthenticated: true,
        forcePasswordReset: Boolean(data.force_password_reset),
        isLoading: false,
        error: null,
      })

      // Fetch associated company info
      try {
        const me = await authApi.getMe()
        set({ company: me.company })
      } catch {
        // Non-blocking
      }

      return data
    } catch (err) {
      set({
        isLoading: false,
        error: err.friendlyMessage || 'Invalid corporate email or password.',
      })
      throw err
    }
  },

  /**
   * Register a new company and owner account.
   */
  registerCompany: async (formData) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authApi.registerCompany(formData)

      storage.setAccessToken(data.access_token)
      storage.setUser(data.user)

      set({
        user: data.user,
        accessToken: data.access_token,
        isAuthenticated: true,
        forcePasswordReset: Boolean(data.force_password_reset),
        isLoading: false,
        error: null,
      })

      try {
        const me = await authApi.getMe()
        set({ company: me.company })
      } catch {
        // Non-blocking
      }

      return data
    } catch (err) {
      set({
        isLoading: false,
        error: err.friendlyMessage || 'Failed to register workspace.',
      })
      throw err
    }
  },

  /**
   * Change password and clear force_password_reset flag.
   */
  changePassword: async (passwords) => {
    set({ isLoading: true, error: null })
    try {
      const result = await authApi.changePassword(passwords)
      set((state) => ({
        forcePasswordReset: false,
        isLoading: false,
        user: state.user ? { ...state.user, force_password_reset: false } : null,
      }))
      return result
    } catch (err) {
      set({ isLoading: false, error: err.friendlyMessage })
      throw err
    }
  },

  /**
   * Update active access token in store and sessionStorage.
   * Invoked automatically by Axios interceptor after successful HttpOnly cookie rotation.
   */
  updateTokens: ({ accessToken, user }) => {
    if (accessToken) storage.setAccessToken(accessToken)
    if (user) storage.setUser(user)

    set((state) => ({
      accessToken: accessToken || state.accessToken,
      user: user || state.user,
      isAuthenticated: true,
    }))
  },

  /**
   * Logout: Instructs backend to clear HttpOnly cookie and purges frontend session data.
   */
  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Non-blocking cleanup
    } finally {
      storage.clearAll()
      set({
        user: null,
        company: null,
        accessToken: null,
        isAuthenticated: false,
        forcePasswordReset: false,
        isLoading: false,
        error: null,
      })
    }
  },

  clearError: () => set({ error: null }),
}))

// Synchronize store with interceptor events from client.js
if (typeof window !== 'undefined') {
  window.addEventListener('wf:tokens-refreshed', (event) => {
    useAuthStore.getState().updateTokens(event.detail)
  })

  window.addEventListener('wf:auth-expired', () => {
    useAuthStore.getState().logout()
  })
}
