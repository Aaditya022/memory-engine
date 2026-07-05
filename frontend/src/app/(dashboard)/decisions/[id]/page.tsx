'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { decisionsApi } from '@/lib/api'
import type { DecisionResponse } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, GitBranch, User, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'

export default function DecisionDetailPage() {
  const params = useParams()
  const [decision, setDecision] = useState<DecisionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    decisionsApi.list()
      .then((res) => {
        const found = res.data.data.find((d: DecisionResponse) => d.id === params.id)
        if (!cancelled) {
          if (found) setDecision(found)
          else setNotFound(true)
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (notFound || !decision) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <GitBranch className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Decision not found</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">This decision doesn&apos;t exist or has been deleted.</p>
        <Link href="/decisions">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Decisions</Button>
        </Link>
      </div>
    )
  }

  const outcomeColorMap: Record<string, string> = {
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    deferred: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-4 mb-8">
        <Link href="/decisions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{decision.decisionText}</h1>
            {decision.finalOutcome && (
              <Badge variant="outline" className={`border px-2.5 py-0.5 text-xs font-medium capitalize ${outcomeColorMap[decision.finalOutcome] || ''}`}>
                {decision.finalOutcome}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{decision.decisionMaker}</span>
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" />{formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80">{decision.alternativesDiscussed || 'No additional context provided.'}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Outcome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80 capitalize">{decision.finalOutcome || 'Pending'}</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
