'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { authApi } from '@/lib/api'
import type { AuthResponse, Role } from '@/types/api'
import { getErrorMessage } from '@/lib/api/client'

export interface User {
  userId: string
  email: string
  role: Role
  organizationId: string
  fullName?: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (organizationName: string, fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeToken(token: string): { userId: string; email: string; role: Role; organizationId: string } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      userId: payload.userId,
      email: payload.sub,
      role: payload.role,
      organizationId: payload.organizationId,
    }
  } catch {
    return null
  }
}

function loadUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('user')
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function persistAuth(data: AuthResponse) {
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  const user: User = {
    userId: data.userId,
    email: decodeToken(data.accessToken)?.email ?? '',
    role: data.role,
    organizationId: data.organizationId,
  }
  localStorage.setItem('user', JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await authApi.login({ email, password })
      persistAuth(res.data)
      setUser({
        userId: res.data.userId,
        email,
        role: res.data.role,
        organizationId: res.data.organizationId,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (organizationName: string, fullName: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await authApi.register({ organizationName, fullName, email, password })
      persistAuth(res.data)
      setUser({
        userId: res.data.userId,
        email,
        role: res.data.role,
        organizationId: res.data.organizationId,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      await authApi.logout(accessToken ?? undefined, refreshToken ?? undefined)
    } catch {
    } finally {
      clearAuth()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const decoded = decodeToken(token)
      if (!decoded) {
        clearAuth()
        setUser(null)
      } else if (!user) {
        const stored = loadUser()
        if (stored) setUser(stored)
      }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!localStorage.getItem('accessToken'),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
