import axios, { type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/store/authStore"
import type { TokenResponse } from "./authApi"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Shared in-flight refresh promise to prevent duplicate concurrent refresh requests
let refreshPromise: Promise<TokenResponse> | null = null

export const requestTokenRefresh = async (): Promise<TokenResponse> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<TokenResponse>(
        `${baseURL}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((res) => {
        const { user, access_token } = res.data
        useAuthStore.getState().setSession(user, access_token)
        return res.data
      })
      .catch((err) => {
        useAuthStore.getState().clearSession()
        throw err
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// Request interceptor: attach bearer access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Response interceptor: handle 401 and retry once via shared refresh call
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined
    if (!originalRequest) {
      return Promise.reject(error)
    }

    const url = originalRequest.url || ""
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh")

    if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const tokenData = await requestTokenRefresh()
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`
        }
        return apiClient(originalRequest)
      } catch (refreshErr) {
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login"
        }
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)
