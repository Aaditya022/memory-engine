'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Search, Loader2, Brain, Sparkles, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { memoryApi } from '@/lib/api'
import type { SearchResultItem } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const typeColors: Record<string, string> = {
  DECISION: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  ACTION_ITEM: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  FACT: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  COMMITMENT: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  DISCUSSION: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-muted p-5">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-muted-foreground/10" />
        <div className="h-5 w-16 rounded-full bg-muted-foreground/10" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted-foreground/10" />
        <div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 w-32 rounded bg-muted-foreground/10" />
        <div className="h-3 w-24 rounded bg-muted-foreground/10" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted-foreground/10" />
    </div>
  )
}

function EmptyState({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  const suggestions = [
    'recent decisions about architecture',
    'action items assigned to me',
    'key commitments from Q3 planning',
  ]
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background ring-1 ring-primary/10">
        <Brain className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Enterprise Semantic Search</h3>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        Search across your organization&apos;s collective memory — meetings, decisions, documents, action items, and facts — using natural language powered by Cognee.
      </p>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Try searching</p>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="block w-full rounded-lg border border-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
          >
            &ldquo;{s}&rdquo;
          </button>
        ))}
      </div>
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
        <Search className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <h3 className="mb-1 text-base font-semibold">No results found</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find anything for &ldquo;{query}&rdquo;. Try rephrasing or using different keywords.
      </p>
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-muted-foreground/30'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="min-w-[2.5ch] text-right text-[11px] font-medium tabular-nums text-muted-foreground">
        {pct}
      </span>
    </div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [results, setResults] = useState<SearchResultItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSearch() {
    const trimmed = query.trim()
    if (!trimmed) return
    setLoading(true)
    setSearched(true)
    try {
      const params: { query: string; memoryType?: string; topK?: number } = { query: trimmed, topK: 20 }
      if (typeFilter !== 'ALL') params.memoryType = typeFilter
      const res = await memoryApi.search(params)
      setResults(res.data.data ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const filtered = results ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <PageHeader
        icon={Search}
        title="Search"
        description="Semantic search across your organization&apos;s collective memory"
      />

      <Card className="overflow-hidden border-muted/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search meetings, decisions, action items…"
                className="h-11 border-muted pl-10 pr-4 text-base placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? '')}>
              <SelectTrigger className="h-11 w-full border-muted sm:w-[150px]">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-muted-foreground/60" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="DECISION">Decision</SelectItem>
                <SelectItem value="ACTION_ITEM">Action Item</SelectItem>
                <SelectItem value="FACT">Fact</SelectItem>
                <SelectItem value="COMMITMENT">Commitment</SelectItem>
                <SelectItem value="DISCUSSION">Discussion</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="h-11 gap-2 sm:w-[120px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? 'Searching' : 'Search'}
            </Button>
          </div>

          <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-muted-foreground/50">
            <kbd className="rounded border border-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">
              ⌘
            </kbd>
            <span>+</span>
            <kbd className="rounded border border-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">
              ⏎
            </kbd>
            <span className="ml-1">to search</span>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ResultSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && searched && filtered.length === 0 && query && <NoResults query={query} />}

      {!loading && !searched && <EmptyState onSuggestion={(q) => { setQuery(q); inputRef.current?.focus() }} />}

      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          <p className="px-1 text-xs font-medium text-muted-foreground/60">
            {filtered.length} result{filtered.length !== 1 && 's'}
          </p>
          <div className="divide-y divide-muted/60 rounded-xl border border-muted/60 bg-card/60 backdrop-blur-sm">
            {filtered.map((item, idx) => (
              <Link
                key={item.memoryId ?? idx}
                href={`/meetings/${item.meetingId ?? '#'}`}
                className="group flex items-start gap-4 p-4 transition-colors hover:bg-muted/30 sm:px-5 sm:py-4"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`border text-[11px] font-medium ${typeColors[item.memoryType] ?? 'bg-muted text-muted-foreground'}`}
                    >
                      {item.memoryType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-foreground/90">
                    {item.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/60">
                    <span className="truncate font-medium text-foreground/70">{item.meetingTitle}</span>
                    <span>· {item.ownerName}</span>
                    <span>· {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  </div>
                  <ScoreBar score={item.finalScore} />
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
