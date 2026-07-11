'use client'

import { useEffect, useState } from 'react'
import { decisionsApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { DecisionResponse } from '@/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain, User, Calendar } from 'lucide-react'
import { ExportButton } from '@/components/app/export-button'
import { formatDistanceToNow } from 'date-fns'

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<DecisionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    decisionsApi
      .list()
      .then((res) => setDecisions(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Decisions</h1>
          <p className="text-muted-foreground">
            Track decisions made across your organization
          </p>
        </div>
        {decisions.length > 0 && (
          <ExportButton
            data={decisions.map((d) => ({
              decision: d.decisionText,
              maker: d.decisionMaker,
              outcome: d.finalOutcome,
              alternatives: d.alternativesDiscussed,
              createdAt: d.createdAt,
            }))}
            filename="decisions"
          />
        )}
      </div>

      {decisions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No decisions recorded yet. Ingest a transcript to extract decisions.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {decisions.map((d) => (
            <Card key={d.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Brain className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium">{d.decisionText}</p>
                      {d.alternativesDiscussed && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Alternatives: {d.alternativesDiscussed}
                        </p>
                      )}
                    </div>
                    {d.finalOutcome && (
                      <div className="rounded-md bg-muted p-2">
                        <p className="text-xs font-medium text-muted-foreground">Outcome</p>
                        <p className="text-sm">{d.finalOutcome}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {d.decisionMaker && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {d.decisionMaker}
                        </span>
                      )}
                      {d.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
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
