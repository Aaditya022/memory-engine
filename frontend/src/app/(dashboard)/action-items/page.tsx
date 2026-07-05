'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { actionItemsApi } from '@/lib/api'
import type { ActionItemResponse, ActionItemStatus } from '@/types/api'
import { ClipboardList, CheckCircle2, Loader2, Calendar, User, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<ActionItemStatus, { label: string; border: string; badge: string; icon: string }> = {
  PENDING: { label: 'Pending', border: 'border-l-amber-500/50', badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10', icon: 'pending' },
  IN_PROGRESS: { label: 'In Progress', border: 'border-l-blue-500/50', badge: 'border-blue-500/30 text-blue-400 bg-blue-500/10', icon: 'progress' },
  DONE: { label: 'Done', border: 'border-l-emerald-500/50', badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10', icon: 'done' },
  CANCELLED: { label: 'Cancelled', border: 'border-l-muted-foreground/30', badge: 'border-muted-foreground/30 text-muted-foreground bg-muted/50', icon: 'cancelled' },
}

const PRIORITY_CONFIG: Record<string, { dot: string; label: string; icon: typeof ArrowUp }> = {
  HIGH: { dot: 'bg-red-500 shadow-[0_0_6px] shadow-red-500/40', label: 'High', icon: ArrowUp },
  MEDIUM: { dot: 'bg-amber-500 shadow-[0_0_6px] shadow-amber-500/40', label: 'Medium', icon: ArrowUp },
  LOW: { dot: 'bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500/40', label: 'Low', icon: ArrowDown },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}

function ActionItemSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-5 w-1 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent ring-1 ring-amber-500/20">
        <ClipboardList className="h-9 w-9 text-amber-400" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No action items</h3>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
        Action items from your meetings will appear here. Start a meeting to generate them automatically.
      </p>
    </motion.div>
  )
}

export default function ActionItemsPage() {
  const [items, setItems] = useState<ActionItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    actionItemsApi.list({ status: statusFilter || undefined })
      .then((res) => { if (!cancelled) setItems(res.data.data) })
      .catch(() => toast.error('Failed to load action items'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [statusFilter])

  const updateStatus = async (id: string, status: ActionItemStatus) => {
    setUpdating(id)
    try {
      await actionItemsApi.updateStatus(id, { status })
      toast.success(`Marked as ${STATUS_CONFIG[status].label.toLowerCase()}`)
      const res = await actionItemsApi.list({ status: statusFilter || undefined })
      setItems(res.data.data)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Action Items"
        description="Track and manage action items from meetings"
        actions={
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ActionItemSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {items.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status]
            const priorityCfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.MEDIUM
            const PriorityIcon = priorityCfg.icon

            return (
              <motion.div key={item.id} variants={cardVariants}>
                <Card
                  className={`rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl transition-all duration-300 hover:border-border/60 hover:shadow-sm border-l-4 ${statusCfg.border}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${priorityCfg.dot}`}>
                        <PriorityIcon className="h-3 w-3 text-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[15px] leading-snug text-foreground/90">
                          {item.task}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground/70">
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground/50" />
                            {item.ownerName}
                          </span>

                          <span className="text-muted-foreground/20 hidden sm:inline">·</span>

                          {item.deadline && (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                              {formatDistanceToNow(new Date(item.deadline), { addSuffix: true })}
                            </span>
                          )}

                          <span className="text-muted-foreground/20 hidden sm:inline">·</span>

                          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                            <AlertCircle className="h-3 w-3" />
                            {priorityCfg.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {item.status !== 'DONE' && item.status !== 'CANCELLED' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(item.id, 'DONE')}
                            disabled={updating === item.id}
                            className="h-9 w-9 rounded-xl transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                          >
                            {updating === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(item.id, 'PENDING')}
                            disabled={updating === item.id}
                            className="h-9 w-9 rounded-xl transition-all hover:bg-amber-500/10 hover:text-amber-400"
                          >
                            {updating === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground/30" />
                            )}
                          </Button>
                        )}

                        <Badge variant="outline" className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
