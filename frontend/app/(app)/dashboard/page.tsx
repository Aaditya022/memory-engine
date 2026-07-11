'use client'

import { useEffect, useState } from 'react'
import {
  Calendar,
  Brain,
  ListChecks,
  Activity,
  Search,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { StatCard } from '@/components/app/stat-card'
import { meetingsApi, decisionsApi, actionItemsApi, timelineApi, healthApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { MeetingResponse, DecisionResponse, ActionItemResponse, TimelineEvent, HealthResponse } from '@/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<MeetingResponse[]>([])
  const [decisions, setDecisions] = useState<DecisionResponse[]>([])
  const [actionItems, setActionItems] = useState<ActionItemResponse[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [meetingsRes, decisionsRes, actionItemsRes, timelineRes, healthRes] = await Promise.all([
          meetingsApi.list(0, 5),
          decisionsApi.list(),
          actionItemsApi.list(),
          timelineApi.list(),
          healthApi.check().catch(() => null),
        ])
        setMeetings(meetingsRes.data.content)
        setDecisions(decisionsRes.data)
        setActionItems(actionItemsRes.data)
        setTimeline(timelineRes.data)
        setHealth(healthRes)
      } catch (err) {
        console.error(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pendingItems = actionItems.filter((a) => a.status === 'PENDING' || a.status === 'IN_PROGRESS')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your organization&apos;s knowledge</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Meetings"
          value={loading ? '...' : meetings.length}
          description="Latest 5 shown below"
          icon={Calendar}
          loading={loading}
        />
        <StatCard
          title="Decisions"
          value={loading ? '...' : decisions.length}
          description="All recorded decisions"
          icon={Brain}
          loading={loading}
        />
        <StatCard
          title="Pending Actions"
          value={loading ? '...' : pendingItems.length}
          description="Open action items"
          icon={ListChecks}
          loading={loading}
        />
        <StatCard
          title="Timeline Events"
          value={loading ? '...' : timeline.length}
          description="Memory timeline entries"
          icon={Activity}
          loading={loading}
        />
        <StatCard
          title="System Status"
          value={health?.status === 'UP' ? 'Online' : loading ? '...' : 'Offline'}
          description={health?.status === 'UP' ? 'All systems operational' : 'Check connection'}
          icon={ShieldCheck}
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Recent Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meetings yet. Create your first meeting to get started.</p>
            ) : (
              <div className="space-y-3">
                {meetings.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.participants?.length > 0
                          ? m.participants.join(', ')
                          : 'No participants'}
                        {m.createdAt && ` · ${formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
              Recent Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : actionItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No action items yet. Ingest a transcript to extract them.</p>
            ) : (
              <div className="space-y-3">
                {actionItems.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.task}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.ownerName} {a.deadline && `· Due ${a.deadline}`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        a.status === 'DONE' ? 'outline' :
                        a.status === 'IN_PROGRESS' ? 'default' :
                        'secondary'
                      }
                      className="ml-2 shrink-0"
                    >
                      {a.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-muted-foreground" />
              Recent Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No decisions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {decisions.slice(0, 5).map((d) => (
                  <div key={d.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{d.decisionText}</p>
                    <p className="text-xs text-muted-foreground">
                      By {d.decisionMaker}
                      {d.createdAt && ` · ${formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No timeline events yet.</p>
            ) : (
              <div className="space-y-3">
                {timeline.slice(0, 5).map((t) => (
                  <div key={t.memoryId} className="flex items-start gap-3 rounded-lg border p-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.memoryType} · {t.meetingTitle}
                        {t.createdAt && ` · ${formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
