'use client'

import { motion } from 'motion/react'
import {
  Upload, FileText, Brain, Hash, Cpu, Database, Network,
  HardDrive, Search, Zap, ChevronRight,
} from 'lucide-react'
import { SectionEyebrow } from './section-eyebrow'

const brand = '#4F8BFF'

function PipelineNode({ icon: Icon, label, highlight = false, delay = 0 }: { icon: React.ElementType; label: string; highlight?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-xl p-3 md:p-4 flex flex-col items-center gap-2 min-w-[90px] md:min-w-[110px] relative z-10"
      style={highlight ? { borderColor: 'rgba(0,212,255,0.4)', boxShadow: '0 0 20px rgba(0,212,255,0.1)' } : {}}
    >
      <div className={`p-2 rounded-lg ${highlight ? 'bg-[#00D4FF]/10' : 'bg-white/[0.03]'}`}>
        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${highlight ? 'text-[#00D4FF]' : 'text-white/60'}`} />
      </div>
      <span className="text-[10px] md:text-[11px] font-medium text-white/70 text-center leading-tight">{label}</span>
    </motion.div>
  )
}

const cogneePipelineSteps = [
  { icon: Upload, label: 'Source', color: 'white' },
  { icon: FileText, label: 'Transcript', color: 'white' },
  { icon: Brain, label: 'LLM Understanding', color: 'white' },
  { icon: Hash, label: 'Entity Extraction', color: 'white' },
  { icon: Cpu, label: 'Cognee', color: 'brand', highlight: true },
  { icon: Database, label: 'Knowledge Objects', color: 'white' },
  { icon: Network, label: 'Knowledge Graph', color: 'white' },
  { icon: HardDrive, label: 'Embeddings', color: 'white' },
  { icon: Search, label: 'Semantic Search', color: 'white' },
  { icon: Zap, label: 'Enterprise Intel', color: 'accent', highlight: true },
]

export function CogneeArchitecture() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-44 border-t border-white/[0.06] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] md:text-[280px] font-bold text-white/[0.015] pointer-events-none select-none leading-none tracking-tighter">
        COGNEE
      </div>

      <div className="text-center max-w-3xl mx-auto relative z-10">
        <SectionEyebrow label="The Engine" tag="Cognee" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 section-title"
        >
          Powered by <span className="gradient-text">Cognee</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 body-text text-white/50 max-w-lg mx-auto"
        >
          From raw source to enterprise intelligence. Every layer purpose-built for persistent organizational memory.
        </motion.p>
      </div>

      <div className="mt-16 relative z-10">
        <div className="hidden lg:flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {cogneePipelineSteps.slice(0, 4).map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <PipelineNode icon={step.icon} label={step.label} highlight={step.highlight} delay={i * 0.06} />
                <ChevronRight className="w-3 h-3 text-white/15" />
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-card-premium rounded-2xl p-5 md:p-6 text-center min-w-[200px]"
            style={{ borderColor: `${brand}30`, boxShadow: `0 0 40px ${brand}15` }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Cpu className="w-6 h-6" style={{ color: brand }} />
              <span className="text-lg font-bold text-white">Cognee</span>
            </div>
            <p className="text-[10px] text-white/40 font-mono">Entity Extraction · Graph Construction · Embedding Generation · Semantic Indexing</p>
          </motion.div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {cogneePipelineSteps.slice(4).map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <PipelineNode icon={step.icon} label={step.label} highlight={step.highlight} delay={0.4 + i * 0.06} />
                {i < cogneePipelineSteps.slice(4).length - 1 && (
                  <ChevronRight className="w-3 h-3 text-white/15" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:hidden space-y-3 max-w-sm mx-auto">
          {cogneePipelineSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.highlight ? 'border' : 'bg-white/[0.03] border border-white/[0.06]'}`}
                style={step.highlight ? { backgroundColor: `${brand}15`, borderColor: `${brand}30` } : {}}>
                <step.icon className={`w-4 h-4 ${step.highlight ? '' : 'text-white/40'}`} style={step.highlight ? { color: brand } : {}} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${step.highlight ? 'text-white' : 'text-white/60'}`}>{step.label}</p>
              </div>
              <span className="text-[9px] font-mono text-white/20">{String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto relative z-10"
      >
        {[
          { value: '99.7%', label: 'Entity recall accuracy' },
          { value: '<200ms', label: 'Semantic query latency' },
          { value: '12.8K', label: 'Knowledge objects indexed' },
          { value: '18.9K', label: 'Graph connections mapped' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-lg px-4 py-3 text-center">
            <p className="text-lg font-bold text-white/90">{stat.value}</p>
            <p className="text-sm text-white/40 mt-0.5 font-mono">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
