'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-emerald-500' : 'text-red-500',
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
