'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { decisionsApi } from '@/lib/api'
import type { DecisionResponse } from '@/types/api'
import { GitBranch, Lightbulb, User, Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

const outcomeColorMap: Record<string, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  deferred: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

const SKELETON_COUNT = 4

function DecisionSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-5 w-5 shrink-0" />
    </div>
  )
}

function DecisionsHeader() {
  return (
    <PageHeader
      icon={GitBranch}
      title="Decisions"
      description="Track every architectural decision and the reasoning behind it."
    />
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center backdrop-blur-sm"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
        <Lightbulb className="h-8 w-8 text-violet-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white/90">No decisions yet</h3>
      <p className="max-w-sm text-sm text-white/50">
        Architectural decisions will appear here once they are created. Each decision captures the context,
        options considered, and the final outcome.
      </p>
    </motion.div>
  )
}

function DecisionCard({ decision }: { decision: DecisionResponse }) {
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/decisions/${decision.id}`} className="group block">
        <Card className="relative overflow-hidden border-white/10 bg-white/[0.04] transition-all duration-300 hover:border-violet-500/40 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-violet-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10">
              <GitBranch className="h-5 w-5 text-violet-400" />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="truncate text-[15px] font-semibold leading-snug text-white/90">
                {decision.decisionText}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {decision.decisionMaker}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {decision.finalOutcome && (
                <Badge
                  variant="outline"
                  className={`border px-2.5 py-0.5 text-xs font-medium capitalize ${
                    outcomeColorMap[decision.finalOutcome] ?? 'bg-white/5 text-white/60 border-white/10'
                  }`}
                >
                  {decision.finalOutcome}
                </Badge>
              )}
              <ChevronRight className="h-5 w-5 text-white/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-violet-400" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<DecisionResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchDecisions() {
      try {
        const res = await decisionsApi.list()
        if (!cancelled) setDecisions(res.data.data)
      } catch {
        if (!cancelled) setDecisions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDecisions()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <DecisionsHeader />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <DecisionSkeleton key={i} />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {decisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
