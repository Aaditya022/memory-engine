'use client'

import { motion } from 'motion/react'
import { DashboardContent } from '@/components/shared/dashboard-content'
import { DEMO, demoRecentMeetings, demoTimelineEvents, demoActionItems } from '@/lib/demo-data'
import { Logo } from '@/components/shared/logo'
import {
  LayoutDashboard, Calendar, Search, GitBranch, Clock, MessageSquare,
  Network, Users, FolderOpen, Shield, Settings, Sparkles,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Calendar, label: 'Meetings' },
  { icon: Search, label: 'Memory Search' },
  { icon: Network, label: 'Knowledge Graph' },
  { icon: GitBranch, label: 'Timeline' },
]

const workspaceItems = [
  { icon: MessageSquare, label: 'Transcripts' },
  { icon: FolderOpen, label: 'Projects' },
  { icon: Users, label: 'People' },
  { icon: Clock, label: 'Action Items' },
  { icon: GitBranch, label: 'Decisions' },
]

const adminItems = [
  { icon: Shield, label: 'Audit Logs' },
  { icon: Settings, label: 'Settings' },
]

export function DashboardPreview() {
  const stats = {
    meetings: DEMO.meetings,
    memories: DEMO.memories,
    decisions: DEMO.decisions,
    actions: DEMO.actionItems,
  }

  const meetings = demoRecentMeetings as any[]
  const timeline = demoTimelineEvents as any[]
  const actionItems = demoActionItems as any[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex min-h-[700px] rounded-2xl border border-border/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden md:flex w-56 flex-col border-r border-border/10 bg-background/30">
            <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border/10">
              <Logo className="w-7 h-7" />
              <span className="text-sm font-semibold text-white/80">Memory Engine</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div>
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1">Navigation</p>
                {navItems.map((item) => (
                  <button key={item.label} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${item.active ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div>
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1">Workspace</p>
                {workspaceItems.map((item) => (
                  <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors">
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div>
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1">Administration</p>
                {adminItems.map((item) => (
                  <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors">
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-border/10">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-brand/10 to-accent/10 border border-brand/20">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span className="text-[11px] font-medium text-white/60">Enterprise Plan</span>
                <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="flex items-center justify-between px-6 h-14 border-b border-border/10 bg-background/20">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  ALL SYSTEMS ONLINE
                </span>
                <span className="text-[10px] text-white/20">·</span>
                <span className="text-[11px] text-white/20 font-mono" id="dashboard-time" />
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-[11px] rounded-lg bg-brand/10 border border-brand/20 text-brand hover:bg-brand/20 transition-colors">
                  <Sparkles className="w-3 h-3 inline-block mr-1.5" />
                  New Source
                </button>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              <DashboardContent
                stats={stats}
                meetings={meetings}
                timeline={timeline}
                actionItems={actionItems}
              />
            </main>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
