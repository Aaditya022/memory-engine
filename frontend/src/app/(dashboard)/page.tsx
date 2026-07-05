'use client'

import { useEffect, useState } from 'react'
import { meetingsApi, actionItemsApi, timelineApi } from '@/lib/api'
import type { MeetingResponse, ActionItemResponse, TimelineEvent } from '@/types/api'
import { DEMO, demoRecentMeetings, demoTimelineEvents, demoActionItems } from '@/lib/demo-data'
import { DashboardContent } from '@/components/shared/dashboard-content'
import { Skeleton } from '@/components/ui/skeleton'

const containerClass = 'rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5 lg:p-6 transition-all duration-300 hover:border-border/60 hover:shadow-sm'

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.06] to-transparent border border-primary/[0.05] p-8">
        <Skeleton className="h-8 w-72 mb-3" />
        <Skeleton className="h-5 w-96" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${containerClass} lg:col-span-2`}>
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className={containerClass}>
          <Skeleton className="h-5 w-28 mb-4" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className={containerClass}>
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-52 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className={containerClass}>
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [meetings, setMeetings] = useState<MeetingResponse[]>([])
  const [actionItems, setActionItems] = useState<ActionItemResponse[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

  const hasRealData = meetings.length > 0 || timelineEvents.length > 0 || actionItems.length > 0

  const displayMeetings = hasRealData ? meetings : demoRecentMeetings as unknown as MeetingResponse[]
  const displayTimeline = hasRealData ? timelineEvents : demoTimelineEvents as unknown as TimelineEvent[]
  const displayActions = hasRealData ? actionItems : demoActionItems as unknown as ActionItemResponse[]

  useEffect(() => {
    async function load() {
      try {
        const [meetingsRes, itemsRes, timelineRes] = await Promise.all([
          meetingsApi.list({ page: 0, size: 100, sort: 'createdAt,desc' }).catch(() => ({ data: { data: { content: [] } } })),
          actionItemsApi.list({}).catch(() => ({ data: { data: [] } })),
          timelineApi.list({}).catch(() => ({ data: { data: [] } })),
        ])
        setMeetings(meetingsRes.data.data.content || [])
        setActionItems(itemsRes.data.data || [])
        setTimelineEvents(timelineRes.data.data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pendingItems = displayActions.filter((i) => i.status === 'PENDING' || i.status === 'IN_PROGRESS')
  const doneItems = displayActions.filter((i) => i.status === 'DONE')

  const stats = hasRealData ? {
    meetings: displayMeetings.length,
    memories: displayTimeline.length,
    decisions: doneItems.length,
    actions: pendingItems.length,
  } : {
    meetings: DEMO.meetings,
    memories: DEMO.memories,
    decisions: DEMO.decisions,
    actions: DEMO.actionItems,
  }

  if (loading) return <DashboardSkeleton />

  return (
    <DashboardContent
      stats={stats}
      meetings={displayMeetings}
      timeline={displayTimeline}
      actionItems={displayActions}
    />
  )
}
