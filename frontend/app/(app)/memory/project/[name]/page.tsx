'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { memoriesApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { SearchResultItem } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FolderOpen, User, FileText, Calendar, Tag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const projectName = decodeURIComponent(params.name as string)

  useEffect(() => {
    memoriesApi
      .byProject(projectName)
      .then((res) => setResults(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [projectName])

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <FolderOpen className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold">{projectName}</h1>
          <p className="text-muted-foreground">
            {results.length} related {results.length === 1 ? 'memory' : 'memories'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No memories found for project &ldquo;{projectName}&rdquo;.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <Card key={r.memoryId}>
              <CardContent className="py-4">
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed">{r.content}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {r.memoryType.replace('_', ' ')}
                    </Badge>
                    {r.ownerName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {r.ownerName}
                      </span>
                    )}
                    {r.meetingTitle && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {r.meetingTitle}
                      </span>
                    )}
                    {r.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Score: {(r.finalScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
