'use client'

import { motion } from 'motion/react'
import {
  Camera, FileText, MessageSquare, HardDrive, Trash2,
  Upload, Cpu, Network, Database, Search, Zap, ChevronRight,
} from 'lucide-react'
import { SectionEyebrow } from './section-eyebrow'

const brand = '#4F8BFF'
const accent = '#00D4FF'

function ComparisonSide({ side, items }: { side: 'left' | 'right'; items: { label: string; icon?: React.ElementType; dead?: boolean }[] }) {
  const isLeft = side === 'left'
  return (
    <div className={`flex flex-col items-center gap-3 ${isLeft ? 'opacity-60' : ''}`}>
      <div className={`text-center mb-4 ${isLeft ? 'text-red-400/60' : ''}`} style={{ color: isLeft ? undefined : accent }}>
        <p className="text-xs font-mono uppercase tracking-[0.15em]">{isLeft ? 'Traditional Apps' : 'Memory Engine'}</p>
      </div>
      <div className="relative flex flex-col items-center gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="glass-card rounded-lg px-4 py-2.5 flex items-center gap-2.5 min-w-[180px] md:min-w-[220px]"
            style={item.dead
              ? { borderColor: 'rgba(239,68,68,0.1)', background: 'rgba(239,68,68,0.03)' }
              : i === items.length - 1 && !isLeft
                ? { borderColor: `${accent}20`, background: `${accent}[0.03]` as string }
                : {}}
          >
            {item.icon && <item.icon className={`w-3.5 h-3.5 ${item.dead ? 'text-red-400/40' : 'text-white/40'}`} />}
            <span className={`text-xs ${item.dead ? 'text-red-400/50 line-through' : 'text-white/70'}`}>{item.label}</span>
            {i < items.length - 1 && !item.dead && (
              <ChevronRight className="w-3 h-3 text-white/20 ml-auto" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const traditionalPipeline = [
  { label: 'Record Meeting', icon: Camera, dead: true },
  { label: 'Transcribe', icon: FileText, dead: true },
  { label: 'Generate Summary', icon: MessageSquare, dead: true },
  { label: 'Archive', icon: HardDrive, dead: true },
  { label: 'Forgotten', icon: Trash2, dead: true },
]

const memoryPipeline = [
  { label: 'Ingest Source', icon: Upload },
  { label: 'Cognee AI Processing', icon: Cpu },
  { label: 'Knowledge Graph', icon: Network },
  { label: 'Enterprise Memory', icon: Database },
  { label: 'Semantic Recall', icon: Search },
  { label: 'Continuous Intel', icon: Zap },
]

export function ComparisonSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-44 border-t border-white/[0.06]" id="solutions">
      <div className="text-center max-w-3xl mx-auto">
        <SectionEyebrow label="The Gap" tag="Comparison" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 section-title"
        >
          Meeting apps capture <span className="text-white/40">words</span>.
          <br />
          Memory Engine captures <span className="gradient-text-cyan">meaning</span>.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 body-text text-white/50 max-w-lg mx-auto"
        >
          The difference between a transcript archive and a living organizational brain.
        </motion.p>
      </div>

      <div className="mt-16 flex flex-col md:flex-row items-start justify-center gap-8 md:gap-16">
        <div className="flex-1 max-w-[320px]">
          <ComparisonSide side="left" items={traditionalPipeline} />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/[0.06] border border-red-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-[11px] font-mono text-red-400/60">Knowledge decay: 100%</span>
            </div>
          </motion.div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-2 pt-12">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: `${brand}15`, borderColor: `${brand}30`, borderWidth: 1 }}
          >
            <Zap className="w-4 h-4" style={{ color: brand }} />
          </motion.div>
          <div className="w-px h-12 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${brand}50, ${accent}50)` }} />
          <span className="text-[9px] font-mono text-white/20 tracking-widest -rotate-90">VS</span>
        </div>

        <div className="flex-1 max-w-[320px]">
          <ComparisonSide side="right" items={memoryPipeline} />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.1)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400/60">Knowledge retention: continuous</span>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-12 glass-card-premium rounded-2xl p-8 text-center max-w-2xl mx-auto"
      >
        <p className="body-text text-white/70 leading-relaxed">
          <span className="text-white font-semibold">Traditional tools</span> treat meetings as standalone events.
          <span className="font-semibold" style={{ color: accent }}> Memory Engine</span> treats every source as a node in a living knowledge graph —
          connected, searchable, and permanently accessible through natural language.
        </p>
      </motion.div>
    </section>
  )
}
