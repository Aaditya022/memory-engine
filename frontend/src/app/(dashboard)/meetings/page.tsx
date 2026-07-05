'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Clock, Users, Brain, ChevronRight, Sparkles } from 'lucide-react'
import { meetingsApi } from '@/lib/api'
import type { MeetingResponse } from '@/types/api'
import { format } from 'date-fns'
import Link from 'next/link'

const SOURCE_STYLES: Record<string, string> = {
  meet: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  zoom: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  manual: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const SOURCE_LABELS: Record<string, string> = {
  meet: 'Google Meet',
  zoom: 'Zoom',
  manual: 'Manual',
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function SourceBadge({ source }: { source: string }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-lg border px-2.5 py-0.5 text-xs font-medium ${SOURCE_STYLES[source] || 'bg-muted/10 text-muted-foreground border-border/20'}`}
    >
      {SOURCE_LABELS[source] || source}
    </Badge>
  )
}

function MeetingCardSkeleton() {
  return (
    <div className="rounded-xl bg-card/60 backdrop-blur-xl border border-border/50 p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-4 w-2/5" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/20">
        <Sparkles className="h-9 w-9 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No meetings yet</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
        Start capturing insights from your conversations. Your meeting memories will appear here.
      </p>
      <Button onClick={onCreate} className="gap-2 rounded-xl">
        <Plus className="h-4 w-4" />
        Create your first meeting
      </Button>
    </motion.div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    meetingsApi
      .list()
      .then((res) => setMeetings(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Meetings"
          description="Manage meetings as knowledge sources for the enterprise memory platform."
        >
          <Button disabled className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </PageHeader>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <MeetingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Meetings"
        description="Browse and manage your meeting memories."
      >
        <Link href="/meetings/new">
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      </PageHeader>

      {meetings.length === 0 ? (
        <EmptyState onCreate={() => window.location.href = '/meetings/new'} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {meetings.map((meeting) => {
            const date = new Date(meeting.createdAt)
            return (
              <motion.div key={meeting.id} variants={cardVariants}>
                <Link href={`/meetings/${meeting.id}`} className="block group">
                  <Card className="rounded-xl bg-card/60 backdrop-blur-xl border border-border/50 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.15)]">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-5 p-5">
                        <div className="flex shrink-0 flex-col items-center justify-center h-16 w-14 rounded-lg bg-gradient-to-b from-muted/80 to-muted/30 border border-border/40">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                            {format(date, 'MMM')}
                          </span>
                          <span className="text-xl font-bold text-foreground leading-tight">
                            {format(date, 'd')}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-semibold text-foreground truncate text-[15px]">
                              {meeting.title || 'Untitled Meeting'}
                            </h3>
                            <SourceBadge source={meeting.source} />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(date, 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {format(date, 'h:mm a')}
                            </span>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-5 shrink-0">
                          <div className="flex flex-col items-center gap-1 min-w-[48px]">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground tabular-nums">
                              {meeting.participants?.length || 0}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              People
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1 min-w-[48px]">
                            <Brain className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground tabular-nums">
                              {meeting.participants?.length || 0}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Memories
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1 min-w-[48px]">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground tabular-nums">
                              {formatDuration(meeting.durationSeconds || 0)}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Duration
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
