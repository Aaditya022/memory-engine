'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

interface UseThemeProps {
  themes: string[]
  forcedTheme?: string
  setTheme: (theme: string) => void
  theme?: string
  resolvedTheme?: string
  systemTheme?: 'dark' | 'light'
}

const ThemeContext = createContext<UseThemeProps>({
  themes: ['dark', 'light'],
  setTheme: () => {},
  theme: 'dark',
  resolvedTheme: 'dark',
  systemTheme: 'dark',
})

export function useTheme() {
  return useContext(ThemeContext)
}

const STORAGE_KEY = 'theme'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'dark'
  try {
    return localStorage.getItem(STORAGE_KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(getStoredTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.style.colorScheme = theme
  }, [theme])

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {}
  }, [])

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
  const systemTheme = getSystemTheme()

  return (
    <ThemeContext.Provider
      value={{
        themes: ['dark', 'light'],
        setTheme,
        theme,
        resolvedTheme,
        systemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
