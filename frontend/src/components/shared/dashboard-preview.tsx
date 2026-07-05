'use client'

import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { DashboardContent } from '@/components/shared/dashboard-content'
import { DEMO, demoRecentMeetings, demoTimelineEvents, demoActionItems } from '@/lib/demo-data'

export function DashboardPreview() {
  const stats = {
    meetings: DEMO.meetings,
    memories: DEMO.memories,
    decisions: DEMO.decisions,
    actions: DEMO.actionItems,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meetings = demoRecentMeetings as unknown as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeline = demoTimelineEvents as unknown as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actionItems = demoActionItems as unknown as any[]

  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [hovered, setHovered] = useState(false)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotateX(-y * 3)
    setRotateY(x * 3)
  }

  const onMouseEnter = () => setHovered(true)
  const onMouseLeave = () => { setRotateX(0); setRotateY(0); setHovered(false) }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full py-24 md:py-32 border-t border-white/[0.06]"
      style={{ perspective: '1000px' }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center mb-12">
        <div className="inline-flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00D4FF', boxShadow: '0 0 8px rgba(0,212,255,0.5)' }} />
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-white/50">Dashboard</span>
          <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-mono uppercase tracking-wider text-white/40">
            Preview
          </span>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
        >
          See your organization&apos;s <span className="gradient-text-cyan">intelligence</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-lg text-white/50 max-w-lg mx-auto"
        >
          Real-time analytics, knowledge graph exploration, and semantic search — all powered by Cognee.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="mx-auto rounded-2xl overflow-hidden transition-all duration-500"
          style={{
            background: 'rgba(14,18,28,0.85)',
            backdropFilter: 'blur(20px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: hovered
              ? '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(79,139,255,0.08)'
              : '0 20px 60px rgba(0,0,0,0.4)',
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 25 }}
        >
          {/* Browser chrome bar */}
          <div className="flex items-center gap-2 px-5 h-11 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-4 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/40 font-mono max-w-[400px] w-full">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <span className="truncate">app.memoryengine.ai — Enterprise Memory Platform</span>
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <DashboardContent
            stats={stats}
            meetings={meetings}
            timeline={timeline}
            actionItems={actionItems}
          />
        </motion.div>
      </div>
    </motion.section>
  )
}
