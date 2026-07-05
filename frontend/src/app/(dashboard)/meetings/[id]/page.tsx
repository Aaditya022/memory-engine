'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { meetingsApi } from '@/lib/api'
import type { MeetingResponse } from '@/types/api'
import { format, formatDistanceToNow } from 'date-fns'
import { Calendar, Clock, Users, ArrowLeft, Brain, Sparkles, MessageSquare, ListChecks, GitBranch, Network, Bot, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

function ParticipantBadge({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 p-3 bg-card/60 backdrop-blur-xl border border-border/50 rounded-lg">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
      </div>
    </div>
  )
}

function PlaceholderTab({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <Icon className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-72" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  )
}

export default function MeetingDetailPage() {
  const params = useParams()
  const [meeting, setMeeting] = useState<MeetingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadMeeting() {
      try {
        setLoading(true)
        const res = await meetingsApi.get(params.id as string)
        setMeeting(res.data.data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    loadMeeting()
  }, [params.id])

  if (loading) return <DetailSkeleton />

  if (notFound || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Meeting not found</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          This meeting doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/meetings">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meetings
          </Button>
        </Link>
      </div>
    )
  }

  const participants: string[] = meeting.participants ?? []
  const duration = meeting.durationSeconds
    ? `${Math.round(meeting.durationSeconds / 60)}m`
    : '—'
  const sourceLabels: Record<string, string> = {
    zoom: 'Zoom',
    meet: 'Google Meet',
    manual: 'Manual',
  }
  const sourceLabel = sourceLabels[meeting.source] ?? meeting.source ?? 'Unknown'
  const date = meeting.createdAt ? new Date(meeting.createdAt) : new Date('2026-07-05')

  const tabs = [
    { value: 'overview', label: 'Overview', icon: Network },
    { value: 'transcript', label: 'Transcript', icon: MessageSquare },
    { value: 'summary', label: 'Summary', icon: FileText },
    { value: 'decisions', label: 'Decisions', icon: GitBranch },
    { value: 'action-items', label: 'Action Items', icon: ListChecks },
    { value: 'ai-chat', label: 'AI Chat', icon: Bot },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <Link href="/meetings" className="shrink-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {meeting.title ?? 'Untitled Meeting'}
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 text-xs font-medium"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {sourceLabel}
            </Badge>
          </div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {format(date, 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {format(date, 'h:mm a')} &middot; {duration}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-muted-foreground/60">
              Updated {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-card-light inline-flex h-auto flex-wrap gap-1 p-1.5">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card-light">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{format(date, 'MMM d, yyyy')}</p>
                <p className="text-sm text-muted-foreground">{format(date, 'h:mm a')}</p>
              </CardContent>
            </Card>
            <Card className="glass-card-light">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{duration}</p>
                <p className="text-sm text-muted-foreground">
                  {meeting.source ?? 'recorded'} session
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card-light">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-lg font-semibold">Complete</p>
                </div>
                <p className="text-sm text-muted-foreground">Summary & insights ready</p>
              </CardContent>
            </Card>
          </div>

          {participants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {participants.map((name, idx) => (
                  <ParticipantBadge key={idx} name={name} />
                ))}
              </div>
            </div>
          )}

          {meeting.durationSeconds && (
            <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{Math.round(meeting.durationSeconds / 60)} minutes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transcript" className="mt-0">
          <PlaceholderTab
            icon={MessageSquare}
            title="Transcript"
            description="The full meeting transcript will appear here once processing is complete."
          />
        </TabsContent>

        <TabsContent value="summary" className="mt-0">
          <PlaceholderTab
            icon={FileText}
            title="Summary"
            description="An AI-generated summary of key points and topics discussed will be shown here."
          />
        </TabsContent>

        <TabsContent value="decisions" className="mt-0">
          <PlaceholderTab
            icon={GitBranch}
            title="Decisions"
            description="Key decisions made during the meeting will be extracted and displayed here."
          />
        </TabsContent>

        <TabsContent value="action-items" className="mt-0">
          <PlaceholderTab
            icon={CheckCircle2}
            title="Action Items"
            description="Tasks and follow-ups assigned during the meeting will be listed here."
          />
        </TabsContent>

        <TabsContent value="ai-chat" className="mt-0">
          <PlaceholderTab
            icon={Bot}
            title="AI Chat"
            description="Ask questions about this meeting and get instant AI-powered answers."
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
