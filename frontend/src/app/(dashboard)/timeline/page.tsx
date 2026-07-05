'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { timelineApi } from '@/lib/api'
import type { TimelineEvent } from '@/types/api'
import { Clock, Search, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const typeConfig: Record<string, { label: string; dot: string; glow: string; badge: string }> = {
  DECISION: {
    label: 'Decision',
    dot: 'bg-violet-500',
    glow: 'shadow-[0_0_8px_rgba(139,92,246,0.6)]',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  },
  ACTION_ITEM: {
    label: 'Action',
    dot: 'bg-amber-500',
    glow: 'shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  FACT: {
    label: 'Fact',
    dot: 'bg-emerald-500',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  COMMITMENT: {
    label: 'Commitment',
    dot: 'bg-blue-500',
    glow: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  DISCUSSION: {
    label: 'Discussion',
    dot: 'bg-rose-500',
    glow: 'shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [topic, setTopic] = useState('')

  useEffect(() => {
    timelineApi
      .list({ topic: topic || undefined })
      .then((res) => setEvents(res.data.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [topic])

  return (
    <div>
      <PageHeader
        title="Timeline"
        description="Chronological view of all memories"
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Clock className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">No timeline events</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Memories extracted from meetings will appear here chronologically
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-violet-500 via-emerald-500 to-blue-500 opacity-40" />
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {events.map((event) => {
              const config = typeConfig[event.memoryType] || typeConfig.DISCUSSION
              return (
                <motion.div key={event.memoryId} variants={itemVariants} className="group relative flex gap-5 pl-12">
                  <div className="absolute left-0 top-2 flex flex-col items-center">
                    <div
                      className={`h-[18px] w-[18px] rounded-full border-[3px] border-background ${config.dot} ${config.glow} ring-2 ring-background transition-transform duration-300 group-hover:scale-125`}
                    />
                  </div>
                  <Link
                    href={`/meetings/${event.meetingId}`}
                    className="min-w-0 flex-1 rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur transition-all duration-200 hover:border-border hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Badge variant="outline" className={`border px-2 py-0 text-[11px] font-semibold uppercase tracking-wider ${config.badge}`}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground/70">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/90">{event.content}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate font-medium">{event.meetingTitle}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="truncate">{event.ownerName}</span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      )}
    </div>
  )
}
