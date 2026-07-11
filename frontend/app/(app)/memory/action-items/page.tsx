'use client'

import { useEffect, useState } from 'react'
import { actionItemsApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { ActionItemResponse, ActionItemStatus } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListChecks, User, Calendar, ArrowUpDown } from 'lucide-react'
import { ExportButton } from '@/components/app/export-button'
import { formatDistanceToNow } from 'date-fns'

const statusColors: Record<ActionItemStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  DONE: 'outline',
  CANCELLED: 'destructive',
}

const statusFilters: { value: ActionItemStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function ActionItemsPage() {
  const [items, setItems] = useState<ActionItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  async function load(status?: ActionItemStatus) {
    setLoading(true)
    try {
      const res = await actionItemsApi.list(
        status ? { status } : undefined
      )
      setItems(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleStatusChange(id: string, newStatus: ActionItemStatus) {
    try {
      const res = await actionItemsApi.updateStatus(id, newStatus)
      setItems((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      )
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const filtered = statusFilter === 'ALL'
    ? items
    : items.filter((a) => a.status === statusFilter)

  if (loading && items.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Action Items</h1>
          <p className="text-muted-foreground">
            Track and manage action items across meetings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <ExportButton
              data={items.map((a) => ({
                task: a.task,
                owner: a.ownerName,
                status: a.status,
                priority: a.priority,
                deadline: a.deadline,
                createdAt: a.createdAt,
              }))}
              filename="action-items"
            />
          )}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {items.length === 0
              ? 'No action items yet. Ingest a transcript to extract them.'
              : 'No action items match the selected filter.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium">{a.task}</p>
                      <Badge variant={statusColors[a.status]}>
                        {a.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {a.ownerName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {a.ownerName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3" />
                        {a.priority}
                      </span>
                      {a.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {a.deadline}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {a.status !== 'DONE' && a.status !== 'CANCELLED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(a.id, 'DONE')}
                        >
                          Mark done
                        </Button>
                      )}
                      {a.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(a.id, 'IN_PROGRESS')}
                        >
                          Start
                        </Button>
                      )}
                      {a.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(a.id, 'PENDING')}
                        >
                          Revert
                        </Button>
                      )}
                      {a.status !== 'CANCELLED' && a.status !== 'DONE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleStatusChange(a.id, 'CANCELLED')}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
