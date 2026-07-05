'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { cn } from '@/lib/utils'

interface PageShellProps {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          sidebarCollapsed ? 'ml-[60px]' : 'ml-56',
        )}
      >
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
