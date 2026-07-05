import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiResponse, AuthResponse, RefreshRequest } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

let accessToken: string | null = null
let refreshToken: string | null = null
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

export function loadTokens() {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken')
    refreshToken = localStorage.getItem('refreshToken')
  }
  return { accessToken, refreshToken }
}

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token!)
    }
  })
  failedQueue = []
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    loadTokens()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      loadTokens()

      if (!refreshToken) {
        clearTokens()
        isRefreshing = false
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      try {
        const refreshPayload: RefreshRequest = { refreshToken }
        const { data } = await axios.post<
          ApiResponse<AuthResponse>
        >(`${API_BASE_URL}/auth/refresh`, refreshPayload)

        if (data.success && data.data) {
          const { accessToken: newAccess, refreshToken: newRefresh } = data.data
          setTokens(newAccess, newRefresh)

          processQueue(null, newAccess)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
          }
          return apiClient(originalRequest)
        }
        throw new Error('Token refresh failed')
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
