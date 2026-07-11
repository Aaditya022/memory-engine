'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { meetingsApi, transcriptsApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { MeetingResponse, TranscriptResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Calendar, Clock, Users, FileText, CheckCircle2, Loader2, Upload } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [meeting, setMeeting] = useState<MeetingResponse | null>(null)
  const [transcripts, setTranscripts] = useState<TranscriptResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rawText, setRawText] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [ingested, setIngested] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const meetingRes = await meetingsApi.get(params.id as string)
        setMeeting(meetingRes.data)

        const transcriptsRes = await transcriptsApi.listByMeeting(params.id as string).catch(() => ({ data: [] }))
        setTranscripts(transcriptsRes.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleIngest(e: FormEvent) {
    e.preventDefault()
    if (!rawText.trim()) return
    setIngesting(true)
    setError('')
    try {
      const res = await transcriptsApi.ingest({
        meetingId: params.id as string,
        rawText: rawText.trim(),
      })
      setTranscripts((prev) => [res.data, ...prev])
      setIngested(true)
      setRawText('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIngesting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error || 'Meeting not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold">{meeting.title}</h1>
        <p className="text-muted-foreground">Meeting details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {meeting.startedAt
                ? format(new Date(meeting.startedAt), 'PPP p')
                : 'No date set'}
            </div>
            {meeting.durationSeconds && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {Math.round(meeting.durationSeconds / 60)} minutes
              </div>
            )}
            {meeting.source && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{meeting.source}</Badge>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Created {meeting.createdAt && formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            {meeting.participants && meeting.participants.length > 0 ? (
              <div className="space-y-2">
                {meeting.participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {p}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No participants listed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transcript Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
            Upload Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIngest} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
            )}
            {ingested && (
              <div className="rounded-md bg-primary/10 p-3 text-sm text-primary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Transcript accepted — processing in background
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rawText">Paste meeting transcript</Label>
              <Textarea
                id="rawText"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the full meeting transcript here to extract action items, decisions, and memories..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={ingesting || !rawText.trim()}>
                {ingesting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Upload Transcript</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Previous Transcripts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Previous Transcripts ({transcripts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transcripts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transcripts uploaded yet. Ingest a transcript to extract action items, decisions, and memories from this meeting.
            </p>
          ) : (
            <div className="space-y-3">
              {transcripts.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Transcript {t.processed ? 'processed' : 'pending'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={t.processed ? 'default' : 'secondary'}>
                    {t.processed ? 'Processed' : 'Processing'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
