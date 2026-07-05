'use client'

import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { DashboardContent } from '@/components/shared/dashboard-content'
import { DEMO, demoRecentMeetings, demoTimelineEvents, demoActionItems } from '@/lib/demo-data'
import type { MeetingResponse, TimelineEvent, ActionItemResponse } from '@/types/api'

export function DashboardPreview() {
  const stats = {
    meetings: DEMO.meetings,
    memories: DEMO.memories,
    decisions: DEMO.decisions,
    actions: DEMO.actionItems,
  }

  const meetings = demoRecentMeetings as MeetingResponse[]
  const timeline = demoTimelineEvents as TimelineEvent[]
  const actionItems = demoActionItems as ActionItemResponse[]

  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotateX(-y * 2)
    setRotateY(x * 2)
  }

  const onMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full py-16 md:py-24"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="rounded-3xl border border-border/10 bg-card/30 backdrop-blur-sm shadow-2xl shadow-black/20 overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(59,130,246,0.08)]"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        transition={{ type: 'spring', stiffness: 80, damping: 25 }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-5 h-12 border-b border-border/10 bg-background/50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-4 h-7 rounded-lg bg-muted/30 border border-border/20 text-[11px] text-muted-foreground/50 font-mono max-w-[400px] w-full">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span className="truncate">app.memoryengine.ai</span>
            </div>
          </div>
        </div>

        {/* Full-size dashboard preview */}
        <div className="pointer-events-none select-none">
          <DashboardContent
            stats={stats}
            meetings={meetings}
            timeline={timeline}
            actionItems={actionItems}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
