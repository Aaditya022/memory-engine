'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { meetingsApi, transcriptsApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { MeetingResponse, TranscriptResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, FileText, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export default function TranscriptPage() {
  const params = useParams()
  const router = useRouter()
  const [meeting, setMeeting] = useState<MeetingResponse | null>(null)
  const [transcripts, setTranscripts] = useState<TranscriptResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rawText, setRawText] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [ingested, setIngested] = useState(false)
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null)
  const [transcriptDetail, setTranscriptDetail] = useState<TranscriptResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await meetingsApi.get(params.id as string)
        setMeeting(res.data)
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
      setTranscripts((prev) => [...prev, res.data])
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
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
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
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Transcript</h1>
        <p className="text-muted-foreground">{meeting.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Ingest Transcript
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
              <Label htmlFor="rawText">Transcript text</Label>
              <Textarea
                id="rawText"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the full meeting transcript here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            <Button type="submit" disabled={ingesting || !rawText.trim()}>
              {ingesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingesting...
                </>
              ) : (
                'Ingest Transcript'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {transcripts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Transcripts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transcripts.map((t) => (
              <div key={t.id}>
                <div className="flex items-center justify-between rounded-lg border p-3">
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
                  <div className="flex items-center gap-2">
                    <Badge variant={t.processed ? 'default' : 'secondary'}>
                      {t.processed ? 'Processed' : 'Processing'}
                    </Badge>
                    {t.processed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (selectedTranscriptId === t.id) {
                            setSelectedTranscriptId(null)
                            setTranscriptDetail(null)
                          } else {
                            setSelectedTranscriptId(t.id)
                            setLoadingDetail(true)
                            try {
                              const res = await transcriptsApi.get(t.id)
                              setTranscriptDetail(res.data)
                            } catch (err) {
                              setError(getErrorMessage(err))
                            } finally {
                              setLoadingDetail(false)
                            }
                          }
                        }}
                      >
                        {selectedTranscriptId === t.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {selectedTranscriptId === t.id && (
                  <div className="mt-2 rounded-lg border bg-muted/30 p-4">
                    {loadingDetail ? (
                      <Skeleton className="h-20 w-full" />
                    ) : transcriptDetail ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>ID: {transcriptDetail.id}</span>
                          <span>Meeting: {transcriptDetail.meetingId}</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Badge variant={transcriptDetail.processed ? 'default' : 'secondary'}>
                            {transcriptDetail.processed ? 'Processed' : 'Processing'}
                          </Badge>
                          {transcriptDetail.processedAt && (
                            <span className="text-muted-foreground">
                              Processed {formatDistanceToNow(new Date(transcriptDetail.processedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
