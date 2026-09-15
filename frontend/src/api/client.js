import axios from 'axios'
import { storage } from '@/lib/storage'

/**
 * Production Axios HTTP Client instance configured with:
 * 1. Base URL pointing to /api/v1
 * 2. withCredentials: true so the browser automatically sends and receives HttpOnly cookies
 * 3. Request interceptor injecting the active in-memory/session access token
 * 4. Concurrency-controlled 401 response interceptor that automatically refreshes
 *    tokens using the browser's HttpOnly cookie and replays failed requests.
 */
export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Enables browser to automatically transmit HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Concurrency queue state for 401 token refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Request Interceptor: Injects active Bearer Access Token into Authorization header
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken()
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response Interceptor: Seamless 401 handling with HttpOnly cookie auto-refresh queue
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and request has not yet been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not attempt to refresh if the failed request was the refresh, login, or register call itself
      const url = originalRequest.url || ''
      if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register-company')) {
        return Promise.reject(formatApiError(error))
      }

      // If a refresh is already in progress, queue this request until completed
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(formatApiError(err)))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Direct raw axios call with withCredentials: true so browser automatically attaches the HttpOnly cookie
        const refreshResponse = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        )

        const { access_token, user } = refreshResponse.data

        // Save fresh access token in sessionStorage
        storage.setAccessToken(access_token)
        if (user) {
          storage.setUser(user)
        }

        // Update default header for subsequent requests
        apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`
        originalRequest.headers.Authorization = `Bearer ${access_token}`

        // Drain queue and resolve pending requests
        processQueue(null, access_token)

        // Dispatch sync event to Zustand store
        window.dispatchEvent(
          new CustomEvent('wf:tokens-refreshed', {
            detail: { accessToken: access_token, user },
          })
        )

        return apiClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        storage.clearAll()
        window.dispatchEvent(
          new CustomEvent('wf:auth-expired', {
            detail: 'Your session has expired. Please sign in again.',
          })
        )
        return Promise.reject(formatApiError(refreshErr))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(formatApiError(error))
  }
)

/**
 * Standardize error responses from FastAPI / Pydantic / Network into clean user-facing messages
 */
export function formatApiError(error) {
  if (!error.response) {
    error.friendlyMessage = error.message || 'Unable to connect to server. Please check your network connection.'
    return error
  }

  const detail = error.response.data?.detail

  if (typeof detail === 'string') {
    error.friendlyMessage = detail
  } else if (Array.isArray(detail)) {
    // Pydantic validation errors list: [{ loc: ['body', 'email'], msg: 'field required' }]
    const messages = detail.map((d) => {
      const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : ''
      return field ? `${field}: ${d.msg}` : d.msg
    })
    error.friendlyMessage = messages.join(' | ')
    error.fieldErrors = detail
  } else if (error.response.status === 403) {
    error.friendlyMessage = 'You do not have permission to perform this action.'
  } else if (error.response.status === 404) {
    error.friendlyMessage = 'The requested resource could not be found.'
  } else if (error.response.status >= 500) {
    error.friendlyMessage = 'Internal server error occurred. Please try again later.'
  } else {
    error.friendlyMessage = error.response.statusText || 'An unexpected error occurred.'
  }

  return error
}
