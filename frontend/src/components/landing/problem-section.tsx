'use client'

import { motion } from 'motion/react'
import { Users, Clock, Target, Calendar, FileText, Trash2, Repeat } from 'lucide-react'
import { SectionEyebrow } from './section-eyebrow'

const purple = '#8C6BFF'

const costCards = [
  { icon: Users, value: '$18.5M', label: 'Avg annual knowledge loss per 1K employees (IDC)', color: '#EF4444' },
  { icon: Clock, value: '5.3 hrs', label: 'Weekly time wasted searching (McKinsey)', color: '#F59E0B' },
  { icon: Target, value: '70%', label: 'Context lost when key employee leaves (Gartner)', color: purple },
]

const problemNarratives = [
  {
    icon: Calendar, title: 'Knowledge lives in silos',
    desc: 'Meetings in Zoom. Decisions in Slack. Documents in Google Drive. Context in people\'s heads. There is no single source of organizational truth.',
    stat: '143 conversations/week',
  },
  {
    icon: FileText, title: 'Context disappears',
    desc: 'A critical decision is made in a 30-minute call. The reasoning, trade-offs, and alternatives — gone the moment the call ends.',
    stat: '87% of decisions undocumented',
  },
  {
    icon: Trash2, title: 'Institutional memory bleeds',
    desc: 'People leave. Teams restructure. Acquisitions happen. The context leaves with them. Every departure erases years of organizational knowledge.',
    stat: '42% knowledge loss per departure',
  },
  {
    icon: Repeat, title: 'History repeats itself',
    desc: 'Same questions, same debates, same decisions — made over and over. Organizations are condemned to repeat their cognitive history.',
    stat: '3.2x slower decision-making',
  },
]

export function ProblemSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-44 relative" id="product">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-red-500/[0.03] to-transparent rounded-full pointer-events-none" />

      <div className="text-center max-w-4xl mx-auto">
        <SectionEyebrow label="The Problem" tag="Enterprise" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 section-title"
        >
          Organizations don&apos;t lose <span className="text-white/40">files</span>.
          <br />
          They lose <span className="gradient-text-cyan">context</span>.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 body-text text-white/50 max-w-2xl mx-auto leading-relaxed"
        >
          Every decision made without context. Every question re-asked. Every new hire starting from zero.
          The cost of organizational amnesia is invisible — but it&apos;s the most expensive line item never tracked.
        </motion.p>
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-4">
        {costCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="glass-card rounded-xl px-6 py-5 text-center min-w-[200px] flex-1 max-w-[280px]"
          >
            <card.icon className="w-5 h-5 mx-auto mb-3" style={{ color: card.color }} />
            <p className="text-3xl font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
            <p className="text-sm text-white/40 mt-2 leading-relaxed">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-4">
        {problemNarratives.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            className="bento-card group"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`)
              e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`)
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="w-5 h-5 text-white/40" />
              <span className="text-[11px] font-mono text-white/20">{card.stat}</span>
            </div>
            <h3 className="text-base font-semibold text-white/80">{card.title}</h3>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
