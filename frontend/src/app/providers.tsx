'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from '@/providers/theme-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { SmoothScroll } from '@/components/shared/smooth-scroll'
import { ScrollProgress } from '@/components/shared/scroll-progress'
import { CursorGlow } from '@/components/shared/cursor-glow'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <SmoothScroll>
            <ScrollProgress />
            <CursorGlow />
            {children}
            <Toaster richColors position="top-right" />
          </SmoothScroll>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
