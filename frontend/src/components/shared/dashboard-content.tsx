'use client'

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Calendar, Brain, ClipboardCheck, Plus,
  Sparkles, TrendingUp, TrendingDown, Search,
  ArrowRight, BarChart3, LineChartIcon, Loader2, Bot, Network,
  Activity, ChevronRight, Users,
  GitBranch, Lightbulb, Target,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { AIChat } from '@/components/shared/ai-chat'
import { KnowledgeGraph } from '@/components/shared/knowledge-graph'
import { DEMO, demoSparklines, demoMonthlyMeetings, demoMonthlyMemories, demoMemoryByType, demoDecisions } from '@/lib/demo-data'
import type { MeetingResponse, ActionItemResponse, TimelineEvent, SearchResultItem } from '@/types/api'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const containerClass = 'rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5 lg:p-6 transition-all duration-300 hover:border-border/60 hover:shadow-sm'

function Sparkline({ data, color, height = 28, width = 56 }: { data: number[]; color: string; height?: number; width?: number }) {
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => `${i * (width / Math.max(data.length - 1, 1))},${height - 2 - (v / max) * (height - 6)}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const KPICard = memo(function KPICard({
  title, value, icon: Icon, spark, color, trend, positive, index,
}: {
  title: string; value: string | number; icon: React.ElementType
  spark: number[]; color: string; trend?: string; positive?: boolean; index: number
}) {
  return (
    <motion.div variants={itemVariants}>
      <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_-8px] hover:shadow-primary/10 hover:bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-[0.06em]">{title}</p>
            <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] p-2.5 text-primary ring-1 ring-primary/10 ring-inset transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <motion.p
                className="text-2xl font-bold tracking-tight"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.06, type: 'spring', stiffness: 120, damping: 14 }}
              >
                {value}
              </motion.p>
              {trend && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {positive
                    ? <TrendingUp className="h-3 w-3 text-emerald-500" />
                    : <TrendingDown className="h-3 w-3 text-red-500" />
                  }
                  <span className={positive ? 'text-[10px] font-medium text-emerald-500/80' : 'text-[10px] font-medium text-red-500/80'}>
                    {trend}
                  </span>
                </div>
              )}
            </div>
            <Sparkline data={spark} color={color} />
          </div>
        </div>
      </div>
    </motion.div>
  )
})

function MemoryBadge({ type }: { type: string }) {
  const s: Record<string, { label: string; class: string }> = {
    DECISION: { label: 'Decision', class: 'border-violet-500/30 text-violet-500 bg-violet-500/10' },
    ACTION_ITEM: { label: 'Action', class: 'border-amber-500/30 text-amber-500 bg-amber-500/10' },
    FACT: { label: 'Fact', class: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' },
    COMMITMENT: { label: 'Commitment', class: 'border-blue-500/30 text-blue-500 bg-blue-500/10' },
    DISCUSSION: { label: 'Discussion', class: 'border-rose-500/30 text-rose-500 bg-rose-500/10' },
  }
  const t = s[type] || { label: type, class: '' }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${t.class}`}>
      {t.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const s: Record<string, { class: string }> = {
    HIGH: { class: 'border-red-500/30 text-red-500 bg-red-500/10' },
    MEDIUM: { class: 'border-amber-500/30 text-amber-500 bg-amber-500/10' },
    LOW: { class: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' },
  }
  const t = s[priority] || { class: '' }
  return (
    <span className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] font-medium ${t.class}`}>
      {priority}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const c = status === 'DONE' ? 'bg-emerald-500' : status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-muted-foreground/30'
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${c} shrink-0`} />
}

interface ChartPayload {
  color: string
  name: string
  value: number
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: ChartPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl px-3.5 py-2.5 text-xs shadow-2xl">
      <p className="font-semibold text-foreground/90 mb-1">{label}</p>
      {payload.map((p: ChartPayload, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-[11px] leading-relaxed">{p.name}: <span className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  )
}

const SectionHeader = memo(function SectionHeader({
  icon: Icon, title, subtitle, action, color,
}: {
  icon: React.ElementType; title: string; subtitle?: string; action?: React.ReactNode; color?: string
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl bg-gradient-to-br ${color || 'from-primary/[0.08] to-primary/[0.02]'} p-2.5 ring-1 ring-primary/10 ring-inset`}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
})

function DashboardHero({
  stats, greeting, timeGreeting, searchQuery, searchResults, searching, searchRef, onSearchChange, onClearSearch, mounted,
}: {
  stats: { memories: number; meetings: number; decisions: number; actions: number }
  greeting: string; timeGreeting: string
  searchQuery: string; searchResults: SearchResultItem[]; searching: boolean
  searchRef: React.RefObject<HTMLInputElement | null>
  onSearchChange: (q: string) => void; onClearSearch: () => void
  mounted: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/[0.06] bg-gradient-to-br from-primary/[0.05] via-primary/[0.02] to-background p-6 lg:p-8">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 left-1/4 w-56 h-56 bg-emerald-500/10 rounded-full blur-[80px]" />
      <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-violet-500/10 rounded-full blur-[60px]" />

      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold text-emerald-500/90 uppercase tracking-[0.08em]">All Systems Online</span>
              </div>
              <span className="text-[10px] text-muted-foreground/40">·</span>
              {mounted && <span className="text-[10px] text-muted-foreground/50 font-mono">{format(new Date(), 'HH:mm:ss')} UTC</span>}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {greeting}
              <span className="ml-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Enterprise</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground/70 max-w-xl leading-relaxed">
              {timeGreeting} &mdash; {stats.memories.toLocaleString()} knowledge objects extracted across {stats.meetings} sources &middot; {stats.decisions} decision chains &middot; {stats.actions} action items pending
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                <Input
                  ref={searchRef}
                  placeholder="Ask anything your organization has ever discussed..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-11 pl-10 pr-4 text-sm rounded-xl bg-background/60 border-border/50 focus-visible:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
                />
                <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 rounded-md border border-border/40 bg-background/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground/50">
                  <span className="text-[8px]">&#8984;</span>K
                </kbd>
              </div>
              <Link href="/meetings/new">
                <Button size="default" className="h-11 rounded-xl gap-2 px-5 shadow-md shadow-primary/10">
                  <Plus className="h-4 w-4" />
                  <span>New Source</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-background/40 backdrop-blur-sm px-4 py-2.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium">AI-powered insights ready</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
              <span className="flex items-center gap-1">
                <Brain className="h-3 w-3" /> {stats.memories.toLocaleString()} memories
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {DEMO.people} members
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mt-4"
            >
              <div className="rounded-2xl border border-border/40 bg-background/80 backdrop-blur-xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/20">
                  <div className="flex items-center gap-2.5">
                    <Search className="h-4 w-4 text-muted-foreground/60" />
                    <span className="text-xs font-medium text-muted-foreground/80">
                      {searching ? `Searching for "${searchQuery}"...` : searchResults.length > 0 ? `${searchResults.length} results for "${searchQuery}"` : `No results for "${searchQuery}"`}
                    </span>
                  </div>
                  <button onClick={onClearSearch} className="text-[10px] text-muted-foreground/40 hover:text-foreground/70 transition-colors font-medium">
                    Clear
                  </button>
                </div>
                {searching ? (
                  <div className="p-8 flex items-center justify-center gap-3 text-xs text-muted-foreground/60">
                    <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
                    Searching across memories...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-border/10 max-h-[320px] overflow-y-auto">
                    {searchResults.map((r) => (
                      <Link
                        key={r.memoryId}
                        href={`/meetings/${r.meetingId}`}
                        className="flex items-center gap-4 px-5 py-3 transition-all hover:bg-muted/20 group"
                      >
                        <MemoryBadge type={r.memoryType} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{r.content}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">{r.meetingTitle} &middot; {r.ownerName}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 rounded-full bg-muted/30 overflow-hidden">
                              <div className="h-full rounded-full bg-primary/40" style={{ width: `${(r.finalScore * 100).toFixed(0)}%` }} />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground/50 w-8 text-right">{(r.finalScore * 100).toFixed(0)}%</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-foreground/50 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <div className="rounded-2xl bg-muted/20 p-4 w-fit mx-auto mb-3">
                      <Search className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/70">No results found</p>
                    <p className="text-xs text-muted-foreground/40 mt-1">Try a different search term or check your spelling.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function KPISection({ stats, pendingItems }: { stats: { memories: number; meetings: number; decisions: number; actions: number }; pendingItems: ActionItemResponse[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard title="Memory Objects" value={stats.memories.toLocaleString()} icon={Brain} spark={demoSparklines.memories} color="oklch(0.546 0.245 262.881)" trend="+8% vs last week" positive index={0} />
      <KPICard title="Knowledge Nodes" value={stats.meetings} icon={GitBranch} spark={demoSparklines.meetings} color="oklch(0.696 0.17 162.48)" trend="+12% vs last week" positive index={1} />
      <KPICard title="Decision Chains" value={stats.decisions} icon={GitBranch} spark={demoSparklines.decisions} color="oklch(0.627 0.265 303.9)" trend="+15% vs last week" positive index={2} />
      <KPICard title="Semantic Queries" value={stats.actions} icon={ClipboardCheck} spark={demoSparklines.actions} color="oklch(0.769 0.188 70.08)" trend={pendingItems.length > 0 ? `${pendingItems.length} active` : 'All done'} positive={pendingItems.length === 0} index={3} />
    </div>
  )
}

export interface DashboardContentProps {
  stats: { memories: number; meetings: number; decisions: number; actions: number }
  meetings: MeetingResponse[]
  timeline: TimelineEvent[]
  actionItems: ActionItemResponse[]
  searchResults?: SearchResultItem[]
}

export function DashboardContent({ stats, meetings, timeline, actionItems, searchResults: externalResults }: DashboardContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [greeting, setGreeting] = useState('Good morning')
  const [timeGreeting, setTimeGreeting] = useState('Start your day with purpose')
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const h = new Date().getHours()
    /* eslint-disable react-hooks/set-state-in-effect */
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    setTimeGreeting(h < 12 ? 'Start your day with purpose' : h < 17 ? 'Keep the momentum going' : 'Wrap up and reflect')
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const pendingItems = actionItems.filter((i) => i.status === 'PENDING' || i.status === 'IN_PROGRESS')

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    const { memoryApi } = await import('@/lib/api')
    const { demoSearchResults } = await import('@/lib/demo-data')
    try {
      const res = await memoryApi.search({ query: q, topK: 5 }).catch(() => ({ data: { data: [] } }))
      setSearchResults(res.data.data.length > 0 ? res.data.data : demoSearchResults as unknown as SearchResultItem[])
    } catch {
      setSearchResults(demoSearchResults as unknown as SearchResultItem[])
    } finally {
      setSearching(false)
    }
  }, [])

  const displaySearchResults = externalResults || searchResults

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 pb-16"
    >
      {/* Hero */}
      <motion.div variants={itemVariants}>
        <DashboardHero
          stats={stats}
          greeting={greeting}
          timeGreeting={timeGreeting}
          searchQuery={searchQuery}
          searchResults={displaySearchResults}
          searching={searching}
          searchRef={searchRef}
          onSearchChange={handleSearch}
          onClearSearch={() => { setSearchQuery(''); setSearchResults([]); searchRef.current?.focus() }}
          mounted={mounted}
        />
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={containerVariants}>
        <KPISection stats={stats} pendingItems={pendingItems} />
      </motion.div>

      {/* Enterprise Memory + Organizational Knowledge Graph */}
      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className={`${containerClass} overflow-hidden p-0`}>
            <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-primary/[0.1] to-primary/[0.02] p-2.5 ring-1 ring-primary/20 ring-inset">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Enterprise Memory</h2>
                  <p className="text-[10px] text-muted-foreground/60">Ask anything across your organization&apos;s collective memory</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] border-primary/20 text-primary bg-primary/[0.04] px-2.5 py-1 rounded-lg gap-1.5">
                <Sparkles className="h-3 w-3" />
                GPT-4o
              </Badge>
            </div>
            <div className="h-[360px]">
              <AIChat />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className={`${containerClass} h-full flex flex-col p-0 overflow-hidden`}>
            <div className="flex items-center gap-3 px-5 lg:px-6 pt-5 lg:pt-6 pb-3">
              <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] p-2.5 ring-1 ring-primary/10 ring-inset">
                <Network className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Organizational Knowledge Graph</h2>
                <p className="text-[10px] text-muted-foreground/60">{(DEMO.knowledgeConnections / 1000).toFixed(0)}K connections mapped by Cognee</p>
              </div>
            </div>
            <div className="flex-1 min-h-0 px-2 pb-2">
              <KnowledgeGraph />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Analytics + Memory Trends */}
      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <div className={containerClass}>
            <SectionHeader icon={BarChart3} title="Organization Intelligence" subtitle="Monthly knowledge ingestion volume" />
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoMonthlyMeetings} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="ac1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.546 0.245 262.881)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.546 0.245 262.881)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.647 0.009 285.938)' }} tickLine={false} axisLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 11, fill: 'oklch(0.647 0.009 285.938)' }} tickLine={false} axisLine={false} allowDecimals={false} dx={-4} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'oklch(1 0 0 / 0.08)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="count" name="Sources" stroke="oklch(0.546 0.245 262.881)" strokeWidth={2.5} fill="url(#ac1)" dot={{ fill: 'oklch(0.546 0.245 262.881)', strokeWidth: 2, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground/60">Average: {Math.round(demoMonthlyMeetings.reduce((s, m) => s + m.count, 0) / demoMonthlyMeetings.length)} sources/month</span>
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <TrendingUp className="h-3 w-3" />
                +16% growth
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className={containerClass}>
            <SectionHeader icon={LineChartIcon} title="Memory Trends" subtitle="Extraction volume over time" action={
              <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500 bg-emerald-500/10 rounded-lg px-2 py-0.5 gap-1">
                <TrendingUp className="h-3 w-3" />
                +28% growth
              </Badge>
            } />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={demoMonthlyMemories} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="ac2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'oklch(0.647 0.009 285.938)' }} tickLine={false} axisLine={false} dy={4} />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'oklch(1 0 0 / 0.08)', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="count" name="Memories" stroke="oklch(0.696 0.17 162.48)" strokeWidth={2.5} fill="url(#ac2)" dot={{ fill: 'oklch(0.696 0.17 162.48)', strokeWidth: 2, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/[0.06] to-emerald-500/[0.02] border border-emerald-500/10">
                  <p className="text-3xl font-bold bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                    {demoMonthlyMemories.reduce((s, m) => s + m.count, 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Total memories extracted</p>
                </div>
                <div className="space-y-2">
                  {demoMemoryByType.slice(0, 4).map((m) => (
                    <div key={m.type} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground/70">{m.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted/30 overflow-hidden">
                          <div className="h-full rounded-full bg-primary/30" style={{ width: `${(m.count / demoMonthlyMemories.reduce((s, mm) => s + mm.count, 0)) * 100}%` }} />
                        </div>
                        <span className="font-medium text-foreground/80 w-10 text-right">{m.count.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Knowledge Sources + Action Items & Decisions */}
      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className={containerClass}>
            <SectionHeader
              icon={Calendar}
              title="Recent Knowledge Sources"
              subtitle={meetings.length > 0 ? `Latest ${Math.min(meetings.length, 6)} of ${meetings.length}` : undefined}
              action={<Link href="/meetings" className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>}
            />
            {meetings.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <div className="rounded-2xl bg-gradient-to-br from-primary/[0.04] to-transparent p-5 mb-4 ring-1 ring-primary/10 ring-inset">
                  <Calendar className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground/80">No knowledge sources yet</p>
                <p className="text-xs text-muted-foreground/50 mt-1 max-w-[240px] text-center">Ingest your first source to start building your organization&apos;s collective memory.</p>
                <Link href="/meetings/new" className="mt-5">
                  <Button size="sm" className="rounded-xl gap-1.5 shadow-md">
                    <Plus className="h-3.5 w-3.5" />
                    New Source
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {(meetings as (MeetingResponse & { memoriesExtracted?: number; source?: string })[]).slice(0, 6).map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.03, duration: 0.35 }}
                  >
                    <Link
                      href={`/meetings/${m.id}`}
                      className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-muted/30 hover:shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] flex items-center justify-center shrink-0 ring-1 ring-primary/10 ring-inset group-hover:ring-primary/20 transition-all">
                        <Calendar className="h-4.5 w-4.5 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{m.title}</p>
                        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                          <span className="text-[10px] text-muted-foreground/50">
                            {formatDistanceToNow(new Date(m.createdAt || m.startedAt), { addSuffix: true })}
                          </span>
                          {m.participants?.length > 0 && (
                            <>
                              <span className="text-[10px] text-muted-foreground/20">|</span>
                              <Users className="h-3 w-3 text-muted-foreground/30" />
                              <span className="text-[10px] text-muted-foreground/60 font-medium">{m.participants.length}</span>
                            </>
                          )}
                          {m.memoriesExtracted && m.memoriesExtracted > 0 && (
                            <>
                              <span className="text-[10px] text-muted-foreground/20">|</span>
                              <Brain className="h-3 w-3 text-muted-foreground/30" />
                              <span className="text-[10px] text-muted-foreground/60 font-medium">{m.memoriesExtracted}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg border border-border/30 bg-background/40 px-2 py-0.5 text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                          {m.source || 'source'}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-foreground/50 transition-colors -mr-1" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className={`${containerClass} flex flex-col h-full`}>
            <SectionHeader
              icon={Lightbulb}
              title="Recent Decisions"
              subtitle="Latest knowledge outcomes"
              action={<Link href="/decisions" className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"><ArrowRight className="h-3 w-3" /></Link>}
            />
            <div className="flex-1 space-y-3">
              {demoDecisions.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <div className="rounded-2xl bg-muted/20 p-4 mb-3">
                    <Lightbulb className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground/70">No decisions recorded</p>
                </div>
              ) : (
                demoDecisions.slice(0, 4).map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.04 }}
                    className="rounded-xl border border-border/30 bg-muted/10 p-3 transition-all hover:bg-muted/20 hover:border-border/50"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        <GitBranch className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium leading-relaxed line-clamp-2">{d.decisionText}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[9px] text-muted-foreground/50">{d.decisionMaker}</span>
                          <span className="text-[9px] text-muted-foreground/20">|</span>
                          <span className="text-[9px] text-muted-foreground/50">{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border/30">
              <SectionHeader
                icon={Target}
                title="Action Items"
                subtitle={pendingItems.length > 0 ? `${pendingItems.length} pending` : undefined}
                action={<Link href="/action-items" className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"><ArrowRight className="h-3 w-3" /></Link>}
              />
              <div className="space-y-2">
                {pendingItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 text-center py-4">No pending action items</p>
                ) : (
                  pendingItems.slice(0, 4).map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.03 }}
                      className="flex items-start gap-2.5 rounded-lg p-2 -mx-1 transition-colors hover:bg-muted/20"
                    >
                      <StatusDot status={item.status} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium leading-snug line-clamp-2">{item.task}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-muted-foreground/50">{item.ownerName}</span>
                          <PriorityBadge priority={item.priority} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div variants={itemVariants}>
        <div className={containerClass}>
          <SectionHeader
            icon={Activity}
            title="Activity Timeline"
            subtitle="Real-time memory extraction feed"
            action={
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-500/70">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </div>
                {timeline.length > 10 && (
                  <Link href="/timeline" className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 ml-2">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            }
          />
          {timeline.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <div className="rounded-2xl bg-gradient-to-br from-primary/[0.04] to-transparent p-5 mb-4 ring-1 ring-primary/10 ring-inset">
                <Activity className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground/80">No activity yet</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Memory extraction events will appear here as knowledge sources are processed by Cognee.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
              <div className="space-y-1 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
                {(timeline as (TimelineEvent & { id?: string })[]).slice(0, 12).map((event, i) => {
                  const dotColor =
                    event.memoryType === 'DECISION' ? 'bg-violet-500 shadow-[0_0_6px] shadow-violet-500/50' :
                    event.memoryType === 'ACTION_ITEM' ? 'bg-amber-500 shadow-[0_0_6px] shadow-amber-500/50' :
                    event.memoryType === 'FACT' ? 'bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500/50' :
                    event.memoryType === 'COMMITMENT' ? 'bg-blue-500 shadow-[0_0_6px] shadow-blue-500/50' :
                    'bg-rose-500 shadow-[0_0_6px] shadow-rose-500/50'
                  const since = formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })
                  const isRecent = since.includes('minute') || since.includes('second') || since.includes('hour')

                  return (
                    <motion.div
                      key={event.memoryId || event.id || i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.025, duration: 0.35 }}
                      className="relative flex items-start gap-4 pl-9 py-2.5 group"
                    >
                      <div className="absolute left-0 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-border/40 bg-background/80 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-primary/30 group-hover:shadow-md">
                        <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 group-hover:scale-125 ${dotColor}`} />
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl px-3 py-2 -mx-1 transition-all duration-200 group-hover:bg-muted/15">
                        <div className="flex items-center gap-2 flex-wrap">
                          <MemoryBadge type={event.memoryType} />
                          <span className={`text-[10px] ${isRecent ? 'text-emerald-500/80 font-semibold' : 'text-muted-foreground/50'}`}>
                            {since}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed mt-1 line-clamp-2 text-foreground/90">{event.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground/50 font-medium">{event.ownerName}</span>
                          <span className="text-[10px] text-muted-foreground/30">&middot;</span>
                          <span className="text-[10px] text-muted-foreground/50">{event.meetingTitle}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              {timeline.length > 12 && (
                <div className="mt-4 pt-3 border-t border-border/20 text-center">
                  <Link href="/timeline" className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5">
                    View all {timeline.length} events <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <div className="h-8 bg-gradient-to-t from-background to-transparent -mt-8 pointer-events-none sticky bottom-0" />
    </motion.div>
  )
}
