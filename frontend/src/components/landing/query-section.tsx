'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search, Brain, GitBranch, Camera, Users, Folder,
  FileText, Eye, ChevronRight,
} from 'lucide-react'
import { SectionEyebrow } from './section-eyebrow'

const brand = '#4F8BFF'
const accent = '#00D4FF'
const purple = '#8C6BFF'

function TypingAnimation({ text, className = '' }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('')
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 25)
    const cursorInterval = setInterval(() => setCursor(c => !c), 500)
    return () => { clearInterval(interval); clearInterval(cursorInterval) }
  }, [text])

  return (
    <span className={className}>
      {displayed}
      <span className="inline-block w-[2px] h-[1em] ml-0.5 align-middle" style={{
        backgroundColor: cursor ? accent : 'transparent',
        boxShadow: cursor ? `0 0 8px ${accent}` : 'none',
      }} />
    </span>
  )
}

function StreamingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: brand }}
          animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function QueryResult({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all cursor-pointer group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/70">{label}</p>
        <p className="text-sm text-white/40 truncate mt-0.5">{value}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
    </div>
  )
}

const queryResults = [
  { icon: GitBranch, label: 'Decision', value: 'Enterprise pricing set at $49/user/month. Approved by Rahul S. and leadership team.', color: brand },
  { icon: Camera, label: 'Source', value: 'Q3 Strategy Session — June 18, 2026 — 12 participants', color: purple },
  { icon: Users, label: 'People Involved', value: 'Rahul S. (VP Product), Sarah C. (CFO), Marcus J. (Sales)', color: accent },
  { icon: Folder, label: 'Related Projects', value: 'Pricing Strategy · Q3 2026 · Enterprise Tier Launch', color: '#10B981' },
]

export function QuerySection() {
  const [streaming, setStreaming] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setStreaming(true), 1500)
    const t2 = setTimeout(() => { setStreaming(false); setShowResults(true) }, 3500)
    const t3 = setTimeout(() => setShowReasoning(true), 4500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-44 border-t border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto">
        <SectionEyebrow label="Interface" tag="Natural Language" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 section-title"
        >
          Instead of searching transcripts...
          <br />
          <span className="gradient-text-cyan">ask your organization</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 body-text text-white/50 max-w-lg mx-auto"
        >
          Natural language interface to your entire organizational memory. Powered by Cognee&apos;s semantic understanding.
        </motion.p>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card-premium rounded-2xl p-6 mb-6"
          style={{ borderColor: `${accent}30` }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15`, borderColor: `${accent}25`, borderWidth: 1 }}>
              <Search className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-mono text-white/90 bg-white/[0.03] px-4 py-3 rounded-xl border border-white/[0.06]">
                &ldquo;What pricing decision was made for Enterprise customers?&rdquo;
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-white/30 font-mono">
                {streaming ? (
                  <>
                    <StreamingDots />
                    <span>Cognee is searching 12.8K knowledge objects...</span>
                  </>
                ) : showResults ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Cognee retrieved 4 results in 187ms</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span>Ready</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {streaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 glass-card rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4" style={{ color: brand }} />
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">AI Analyzing</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                <TypingAnimation text="Analyzing pricing committee meeting transcript from June 18... Cross-referencing with Stripe pricing comparison v2.3 and Q2 board deck..." />
              </p>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {queryResults.map((r, i) => (
                <motion.div
                  key={r.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <QueryResult icon={r.icon} label={r.label} value={r.value} color={r.color} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReasoning && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 grid md:grid-cols-2 gap-4"
            >
              <div className="glass-card-premium rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4" style={{ color: brand }} />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">Reasoning Trail</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Decision was reached after comparing Stripe, Braintree, and Adyen pricing models.
                  Rahul recommended Stripe Connect based on volume discounts. Sarah approved the $49/user/month tier contingent on annual commitment.
                </p>
              </div>
              <div className="glass-card-premium rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4" style={{ color: accent }} />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">3 References</span>
                </div>
                <div className="space-y-2">
                  {[
                    'Stripe Pricing Comparison — v2.3 (PDF)',
                    'Q2 Board Deck — Pricing Slides (Slides)',
                    'Customer Feedback — Enterprise Tier (Notion)',
                  ].map((ref, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                      <FileText className="w-3.5 h-3.5 text-white/20" />
                      {ref}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
