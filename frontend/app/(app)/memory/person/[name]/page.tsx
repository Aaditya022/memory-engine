'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { memoriesApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { MemoryResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Calendar, Brain, ListChecks, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function PersonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [memories, setMemories] = useState<MemoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const personName = decodeURIComponent(params.name as string)

  useEffect(() => {
    memoriesApi
      .byPerson(personName)
      .then((res) => setMemories(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [personName])

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold">{personName}</h1>
          <p className="text-muted-foreground">
            {memories.length} memory {memories.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>
      ) : memories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No memories found for {personName}.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {memories.map((m) => (
            <Card key={m.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {m.memoryType === 'DECISION' ? (
                    <Brain className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {m.memoryType.replace('_', ' ')}
                      </Badge>
                      {m.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {m.eventDate}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                      </span>
                      {m.confidence && (
                        <span>Confidence: {(m.confidence * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={async () => {
                      try {
                        await memoriesApi.delete(m.id)
                        setMemories((prev) => prev.filter((item) => item.id !== m.id))
                      } catch (err) {
                        setError(getErrorMessage(err))
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
