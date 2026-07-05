'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { AuthResponse, Role, LoginRequest, RegisterRequest } from '@/types/api'
import { authApi } from '@/lib/api'
import { setTokens, clearTokens, loadTokens } from '@/lib/api-client'

interface AuthState {
  user: {
    userId: string
    role: Role
    organizationId: string
  } | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<AuthResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getInitialState(): AuthState {
  if (typeof window !== 'undefined') {
    const tokens = loadTokens()
    if (tokens.accessToken) {
      try {
        const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]))
        return {
          user: {
            userId: payload.userId,
            role: payload.role,
            organizationId: payload.organizationId,
          },
          isAuthenticated: true,
          isLoading: false,
        }
      } catch {
        clearTokens()
      }
    }
  }
  return { user: null, isAuthenticated: false, isLoading: false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState)

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data)
    const authData = response.data.data
    setTokens(authData.accessToken, authData.refreshToken)
    setState({
      user: {
        userId: authData.userId,
        role: authData.role,
        organizationId: authData.organizationId,
      },
      isAuthenticated: true,
      isLoading: false,
    })
    return authData
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    const authData = response.data.data
    setTokens(authData.accessToken, authData.refreshToken)
    setState({
      user: {
        userId: authData.userId,
        role: authData.role,
        organizationId: authData.organizationId,
      },
      isAuthenticated: true,
      isLoading: false,
    })
    return authData
  }, [])

  const logout = useCallback(async () => {
    try {
      const tokens = loadTokens()
      await authApi.logout(tokens.refreshToken ?? undefined)
    } catch {
    } finally {
      clearTokens()
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
