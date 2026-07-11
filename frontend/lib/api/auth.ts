import { api } from './client'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
} from '@/types/api'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data).then((r) => r.data),

  refresh: (data: RefreshRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', data).then((r) => r.data),

  logout: (accessToken?: string, refreshToken?: string) =>
    api.post<ApiResponse<null>>(
      '/auth/logout',
      refreshToken ? { refreshToken } : undefined,
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined
    ).then((r) => r.data),
}
