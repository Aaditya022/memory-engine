'use client'

import type { ReactNode, ElementType } from 'react'

interface PageHeaderProps {
  title?: string
  heading?: string
  description?: string | ReactNode
  icon?: ElementType
  actions?: ReactNode
  children?: ReactNode
}

export function PageHeader({ title, heading, description, icon: Icon, actions, children }: PageHeaderProps) {
  const headline = title ?? heading ?? ''
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="min-w-0 flex items-center gap-3">
        {Icon && (
          <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
          <h1 className="text-2xl font-bold tracking-tight">{headline}</h1>
          {description && (
            typeof description === 'string' ? (
              <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>
            ) : (
              <div className="mt-1">{description}</div>
            )
          )}
        </div>
        {(actions || children) && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
            {children}
          </div>
        )}
      </div>
  )
}
