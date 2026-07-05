'use client'

import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="mb-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 p-4 ring-1 ring-border/50">
        <div className="text-muted-foreground/40">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground/60 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
