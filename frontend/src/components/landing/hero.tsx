'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import NextLink from 'next/link'
import { Play, Search, ChevronRight, Sparkles, Clock, CheckCircle, Users, FileText, Lightbulb, Target, ArrowRight, Loader2 } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from './buttons'
import { TrustBar } from './trust-bar'

const brand = '#4F8BFF'
const accent = '#00D4FF'
const purple = '#8C6BFF'

const resultCards = [
  { id: '1', label: 'Pricing Committee', type: 'Decision', detail: 'Enterprise Pricing: $49/user/month approved', source: 'Q3 Strategy — June 18, 2025', person: 'Rahul S. — VP Product', project: 'Pricing Strategy Q3 2026' },
  { id: '2', label: 'Executive Review', type: 'Approval', detail: 'Final approval granted for enterprise tier', source: 'Exec Sync — June 20, 2025', person: 'Elena R. — CEO', project: 'Go-to-Market Q3' },
  { id: '3', label: 'Engineering Sync', type: 'Discussion', detail: 'API migration timeline moved to Q4', source: 'Eng Sync — June 22, 2025', person: 'Marcus J. — CTO', project: 'API Migration' },
  { id: '4', label: 'Design Review', type: 'Decision', detail: 'New dashboard layout approved for v2.0', source: 'Design Review — June 19, 2025', person: 'Amy L. — Design Lead', project: 'Dashboard v2.0' },
]

const statItems = [
  { icon: Target, label: 'Active Decisions', value: 34, color: brand },
  { icon: CheckCircle, label: 'Action Items', value: 89, color: '#34d399' },
  { icon: Users, label: 'Team Members', value: 74, color: accent },
  { icon: FileText, label: 'Sources Processed', value: 1847, color: purple },
]

function AnimatedStat({ value, label, icon: Icon, color }: { value: number; label: string; icon: React.ElementType; color: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true)
          const duration = 1200
          const steps = 30
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  const display = value >= 1000 ? `${(count / 1000).toFixed(1)}k` : count

  return (
    <div ref={ref} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[11px] text-white/50">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white/80 font-mono tabular-nums">{display}</span>
    </div>
  )
}

function HeroGlow({ className = '', color, delay = 0 }: { className?: string; color: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

const badgeData = [
  { label: 'SOC2 Type II certified', dot: '#34d399' },
  { label: 'End-to-end encrypted', dot: '#34d399' },
  { label: 'GDPR compliant', dot: '#34d399' },
]

export function HeroSection() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [hovered, setHovered] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dashboardRef.current) return
    const rect = dashboardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotateX(-y * 4)
    setRotateY(x * 4)
  }

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (!query.trim()) return
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 600)
  }, [])

  const filteredResults = searchQuery.trim()
    ? resultCards.filter(r =>
        r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.person.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resultCards

  return (
    <section className="pt-28 md:pt-36 pb-20 md:pb-28 text-center flex flex-col items-center relative px-6 overflow-hidden min-h-screen">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110"
          style={{ filter: 'blur(3px) saturate(1.3)' }}
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/85 via-[#070B14]/60 to-[#070B14]" />
      </div>

      <HeroGlow className="top-20 left-[10%] w-72 h-72 opacity-20" color={`rgba(79,139,255,0.3)`} />
      <HeroGlow className="top-40 right-[15%] w-80 h-80 opacity-15" color={`rgba(0,212,255,0.25)`} delay={1} />
      <HeroGlow className="bottom-10 left-[30%] w-48 h-48 opacity-10" color={`rgba(140,107,255,0.3)`} delay={2} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-gradient-to-b from-primary/[0.04] via-accent/[0.02] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col items-center">
        <TrustBar />

        <motion.h1 className="hero-title max-w-5xl mx-auto mt-6">
          <motion.span
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="block text-white"
          >
            Your organization&apos;s
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="block text-white"
          >
            collective memory.
          </motion.span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-3xl mx-auto"
        >
          <p className="hero-subtitle text-white/80 font-normal">
            Every decision, conversation, and document becomes permanently{' '}
            <span className="gradient-text-premium">queryable</span>
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 body-text text-white/50 max-w-2xl mx-auto leading-relaxed"
        >
          Memory Engine is the category-defining Enterprise Memory Platform. Powered by Cognee, it transforms every source of organizational knowledge into a connected, searchable, permanently accessible intelligence layer. The brain your enterprise never had.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <NextLink href="/login">
            <PrimaryButton label="Book a Demo" size="lg" icon={<Play className="w-4 h-4" />} />
          </NextLink>
          <SecondaryButton>
            <Play className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            Watch 2-min demo
          </SecondaryButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-6 text-sm text-white/40 flex items-center justify-center gap-6"
        >
          {badgeData.map((item, i) => (
            <motion.span
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-1.5"
            >
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: item.dot }} />
              {item.label}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 md:mt-16 w-full max-w-5xl mx-auto"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            ref={dashboardRef}
            onMouseMove={onMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setRotateX(0); setRotateY(0); setHovered(false) }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto rounded-xl overflow-hidden text-left"
            style={{
              background: 'rgba(10,14,23,0.9)',
              backdropFilter: 'blur(16px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: hovered
                ? '0 40px 100px rgba(0,0,0,0.6), 0 0 80px rgba(79,139,255,0.1)'
                : '0 25px 70px rgba(0,0,0,0.5)',
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 h-9 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-3 h-5 rounded bg-white/[0.04] border border-white/[0.06] text-[9px] text-white/40 font-mono max-w-[320px] w-full">
                  <svg className="w-2 h-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  <span className="truncate">app.memoryengine.ai</span>
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="p-4 md:p-5 space-y-4">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand to-purple flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white/90">Memory Engine</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider text-white/40 border border-white/[0.06]">Enterprise</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/40">
                  <span className="hover:text-white/60 cursor-pointer">Dashboard</span>
                  <span className="text-white/60 border-b border-white/20 pb-0.5">Memory</span>
                  <span className="hover:text-white/60 cursor-pointer">Sources</span>
                </div>
              </div>

              {/* Search bar - interactive */}
              <div className="relative">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] cursor-text transition-all duration-200 hover:border-white/[0.15]"
                  onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50) }}
                >
                  <Search className="w-3.5 h-3.5 text-white/30" />
                  {searchOpen ? (
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                      placeholder="Search organizational memory..."
                      className="text-xs text-white/80 bg-transparent flex-1 outline-none placeholder:text-white/30"
                    />
                  ) : (
                    <span className="text-xs text-white/30 flex-1">Search organizational memory...</span>
                  )}
                  <span className="text-[10px] text-white/20 font-mono px-1.5 py-0.5 rounded border border-white/[0.06]">⌘K</span>
                </div>

                <AnimatePresence>
                  {searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/[0.08] bg-[#0E121C] shadow-xl z-20 overflow-hidden"
                    >
                      {isSearching ? (
                        <div className="flex items-center gap-2 p-3">
                          <Loader2 className="w-3 h-3 text-brand animate-spin" />
                          <span className="text-[11px] text-white/50">Cognee searching memories...</span>
                        </div>
                      ) : filteredResults.length > 0 ? (
                        <div className="py-1">
                          {filteredResults.map((r) => (
                            <button
                              key={r.id}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.04] transition-colors"
                              onMouseDown={(e) => { e.preventDefault(); setSearchQuery(r.detail); setSearchOpen(false); setSelectedResult(r.id) }}
                            >
                              <Search className="w-3 h-3 text-brand/60 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] text-white/70 truncate block">{r.detail}</span>
                                <span className="text-[10px] text-white/30 truncate block">{r.source}</span>
                              </div>
                              <ArrowRight className="w-3 h-3 text-white/20 shrink-0" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-[11px] text-white/30 text-center">No results found</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main grid */}
              <div className="grid md:grid-cols-5 gap-4">
                {/* Left: Decision Timeline */}
                <div className="md:col-span-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Decision Timeline</span>
                  </div>

                  {/* Timeline item - clickable */}
                  <motion.div
                    layout
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
                    onClick={() => setSelectedResult(selectedResult === 'timeline' ? null : 'timeline')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white/80">Q3 Strategy Session</span>
                      <span className="text-[10px] text-white/30">June 18, 2025</span>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <div className="mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                      </div>
                      <div>
                        <p className="text-[11px] text-white/60 leading-relaxed">
                          <span className="text-white/80 font-medium">What pricing decision was made for Enterprise customers?</span>
                        </p>
                        <p className="text-[11px] text-white/50 leading-relaxed mt-1">
                          Enterprise pricing was set at <span className="text-white/80">$49/user/month</span> during the Q3 Strategy session. Decision logged with 96% confidence. 3 supporting references found.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <Lightbulb className="w-3 h-3 text-yellow-400/60" />
                      <span>Cognee retrieved from 4 sources</span>
                    </div>

                    <AnimatePresence>
                      {selectedResult === 'timeline' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-white/[0.06] text-[10px] text-white/30 space-y-1.5">
                            <p><span className="text-white/50">Meeting:</span> Q3 Strategy — June 18, 2025</p>
                            <p><span className="text-white/50">Participants:</span> Rahul S., Elena R., Marcus J., Amy L.</p>
                            <p><span className="text-white/50">Confidence:</span> 96% · <span className="text-emerald-400/70">3 supporting references</span></p>
                            <p><span className="text-white/50">Related decisions:</span> Budget approval, Timeline adjustment</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Results header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{filteredResults.length} Results Sorted by Cognee Relevance</span>
                    <span className="text-[10px] text-brand/70 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI ranked
                    </span>
                  </div>

                  {/* Result cards - clickable */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredResults.map((item, i) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-all duration-200 ${
                            selectedResult === item.id
                              ? 'border-brand/30 bg-brand/[0.04]'
                              : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]'
                          }`}
                          onClick={() => setSelectedResult(selectedResult === item.id ? null : item.id)}
                        >
                          <div className="w-6 h-6 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                            {i === 0 ? <Target className="w-3 h-3 text-brand" /> : i === 1 ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : i === 2 ? <Lightbulb className="w-3 h-3 text-yellow-400/70" /> : <FileText className="w-3 h-3 text-cyan-400/70" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-white/80">{item.label}</span>
                              <span className="text-[9px] text-brand/60 font-mono uppercase px-1 py-0.5 rounded border border-brand/10 bg-brand/[0.04]">{item.type}</span>
                            </div>
                            <p className="text-[11px] text-white/60 leading-relaxed">{item.detail}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[10px] text-white/30">
                              <span className="flex items-center gap-1"><FileText className="w-2.5 h-2.5" />{item.source}</span>
                              <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" />{item.person}</span>
                            </div>

                            <AnimatePresence>
                              {selectedResult === item.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 pt-2 border-t border-white/[0.06] text-[10px] text-white/30 space-y-1">
                                    <p><span className="text-white/50">Person:</span> {item.person}</p>
                                    <p><span className="text-white/50">Project:</span> {item.project}</p>
                                    <p><span className="text-white/50">Source:</span> {item.source}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-[9px] text-brand/60 px-1.5 py-0.5 rounded border border-brand/10 bg-brand/[0.04]">View Source</span>
                                      <span className="text-[9px] text-white/30 px-1.5 py-0.5 rounded border border-white/[0.06]">Share</span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <ChevronRight className={`w-3 h-3 shrink-0 mt-1 transition-transform duration-200 ${selectedResult === item.id ? 'rotate-90 text-brand/60' : 'text-white/20'}`} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right: Stats + Context */}
                <div className="md:col-span-2 space-y-3">
                  <div className="space-y-2">
                    {statItems.map((item, i) => (
                      <AnimatedStat key={i} {...item} />
                    ))}
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-purple animate-pulse" />
                      <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Cognee Insight</span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Recently processed <span className="text-white/60">Q3 Strategy</span> and <span className="text-white/60">Executive Sync</span> meetings. 12 new memories extracted, 3 decisions linked to existing knowledge graph.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-brand/60">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>AI processing active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
