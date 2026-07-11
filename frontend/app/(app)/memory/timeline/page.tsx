'use client'

import { useEffect, useState } from 'react'
import { timelineApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { TimelineEvent } from '@/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { History, Search, Calendar, FileText, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topic, setTopic] = useState('')

  async function load(top?: string) {
    setLoading(true)
    try {
      const res = await timelineApi.list(top || undefined)
      setEvents(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleTopicSearch() {
    load(topic)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timeline</h1>
        <p className="text-muted-foreground">
          Chronological view of all memories in your organization
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTopicSearch()}
            placeholder="Filter by topic (e.g., project name)..."
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {topic
              ? `No timeline events found for "${topic}"`
              : 'No timeline events yet. Ingest a transcript to populate the timeline.'}
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-5 top-0 h-full w-px bg-border" />
          {events.map((e, i) => (
            <div key={`${e.memoryId}-${i}`} className="relative flex gap-6 pb-8 last:pb-0">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm leading-relaxed">{e.content}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {e.memoryType.replace('_', ' ')}
                  </Badge>
                  {e.meetingTitle && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {e.meetingTitle}
                    </span>
                  )}
                  {e.ownerName && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {e.ownerName}
                    </span>
                  )}
                  {e.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
