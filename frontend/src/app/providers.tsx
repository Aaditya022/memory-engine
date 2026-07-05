'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from '@/providers/theme-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { SmoothScroll } from '@/components/shared/smooth-scroll'
import { ScrollProgress } from '@/components/shared/scroll-progress'
import { CursorGlow } from '@/components/shared/cursor-glow'
import SplashCursor from '@/components/shared/splash-cursor'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <SmoothScroll>
            <SplashCursor
              DYE_RESOLUTION={720}
              DENSITY_DISSIPATION={4}
              VELOCITY_DISSIPATION={2.5}
              CURL={4}
              SPLAT_RADIUS={0.15}
              SPLAT_FORCE={5000}
              RAINBOW_MODE={true}
              COLOR_UPDATE_SPEED={8}
              TRANSPARENT={true}
            />
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
