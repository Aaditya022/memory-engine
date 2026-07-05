'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import NextLink from 'next/link'
import {
  Star, Play, ArrowRight, Menu, X, Search, Calendar, FileText, Folder, Trash2,
  Repeat, Upload, Cpu, Sparkles, Network, Database, MessageSquare, Zap,
  Shield, Lock, Users, Camera, ClipboardList, Code, Server, Clock, GitBranch, Brain,
  Check, ChevronRight, Target, Building,
  HardDrive, Hash, Eye,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { DashboardPreview } from '@/components/shared/dashboard-preview'
/* ───────────────────────────────────────────
   Design Tokens
   ─────────────────────────────────────────── */
const brand = '#3B82F6'

/* ───────────────────────────────────────────
   Shared Primitives
   ─────────────────────────────────────────── */



function PrimaryButton({ label, size, className = '' }: { label: string; size?: 'sm' | 'lg'; className?: string }) {
  const sizeClasses = size === 'sm' ? 'px-4 py-2 text-sm' : size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'
  return (
    <button className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#070B14] font-semibold ${sizeClasses} transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.97] relative overflow-hidden ${className}`}>
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <span className="relative">{label}</span>
      <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[2px] relative" />
    </button>
  )
}

function SecondaryButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={`group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 text-white font-medium text-sm px-6 py-3 transition-all duration-300 hover:bg-white/5 hover:border-white/25 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-[0.97] ${className}`}>
      {children}
    </button>
  )
}

function GhostButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={`group inline-flex items-center gap-1.5 text-white/60 text-sm font-medium hover:text-white transition-all duration-300 ${className}`}>
      {children}
      <ArrowRight className="w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-[2px]" />
    </button>
  )
}

function SectionEyebrow({ label, tag }: { label: string; tag?: string }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
      <span className="text-xs font-mono uppercase tracking-[0.15em] text-white/50">{label}</span>
      {tag && (
        <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-mono uppercase tracking-wider text-white/40">
          {tag}
        </span>
      )}
    </div>
  )
}

const heroGradientStyle: React.CSSProperties = {
  backgroundImage: 'linear-gradient(to right, #070B14 0%, #1e3a5f 15%, #22D3EE 35%, #3B82F6 50%, #1e3a5f 65%, #070B14 85%, #070B14 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise)',
}

/* ───────────────────────────────────────────
   Component — Pipeline Node
   ─────────────────────────────────────────── */
function PipelineNode({ icon: Icon, label, highlight = false, delay = 0 }: { icon: React.ElementType; label: string; highlight?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card rounded-xl p-3 md:p-4 flex flex-col items-center gap-2 min-w-[90px] md:min-w-[110px] relative z-10 ${highlight ? 'border-accent/40 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : ''}`}
    >
      <div className={`p-2 rounded-lg ${highlight ? 'bg-accent/10' : 'bg-white/[0.03]'}`}>
        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${highlight ? 'text-accent' : 'text-white/60'}`} />
      </div>
      <span className="text-[10px] md:text-[11px] font-medium text-white/70 text-center leading-tight">{label}</span>
    </motion.div>
  )
}

/* ───────────────────────────────────────────
   Component — Comparison Side
   ─────────────────────────────────────────── */
function ComparisonSide({ side, items }: { side: 'left' | 'right'; items: { label: string; icon?: React.ElementType; dead?: boolean }[] }) {
  const isLeft = side === 'left'
  return (
    <div className={`flex flex-col items-center gap-3 ${isLeft ? 'opacity-60' : ''}`}>
      <div className={`text-center mb-4 ${isLeft ? 'text-red-400/60' : 'text-accent'}`}>
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
            className={`glass-card rounded-lg px-4 py-2.5 flex items-center gap-2.5 min-w-[180px] md:min-w-[220px] ${item.dead ? 'border-red-500/10 bg-red-500/[0.03]' : ''} ${!isLeft && i === items.length - 1 ? 'border-accent/20 bg-accent/[0.03]' : ''}`}
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

/* ───────────────────────────────────────────
   Component — Query Result
   ─────────────────────────────────────────── */
function QueryResult({ icon: Icon, label, value, color, delay = 0 }: { icon: React.ElementType; label: string; value: string; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer group"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-white/70">{label}</p>
        <p className="text-[10px] text-white/40 truncate mt-0.5">{value}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
    </motion.div>
  )
}

/* ───────────────────────────────────────────
   Component — Trust Bar
   ─────────────────────────────────────────── */
function TrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 flex items-center gap-4 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02]"
    >
      <div className="flex -space-x-2">
        {[1,2,3,4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-[#111827] to-[#0D1117] border border-white/10"
          />
        ))}
      </div>
      <span className="text-xs text-white/50">
        Trusted by <span className="text-white/70 font-medium">2,400+</span> forward-thinking enterprises
      </span>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.05, duration: 0.3, type: 'spring' }}
          >
            <Star className="w-3 h-3 fill-accent text-accent" />
          </motion.div>
        ))}
        <span className="text-xs text-white/40 ml-1">4.9/5</span>
      </div>
    </motion.div>
  )
}

/* ───────────────────────────────────────────
   Component — Hero Product Preview
   ─────────────────────────────────────────── */
/* ───────────────────────────────────────────
   Section 1 — The Problem
   Premium visual storytelling about context loss
   ─────────────────────────────────────────── */
const costCards = [
  {
    icon: Users, value: '$18.5M', label: 'Avg annual knowledge loss per 1K employees (IDC)',
    color: '#EF4444',
  },
  {
    icon: Clock, value: '5.3 hrs', label: 'Weekly time wasted searching for information (McKinsey)',
    color: '#F59E0B',
  },
  {
    icon: Target, value: '70%', label: 'Of context lost when a key employee leaves (Gartner)',
    color: '#8B5CF6',
  },
]

const problemNarratives = [
  {
    icon: Calendar, title: 'Knowledge lives in silos',
    desc: 'Meetings in Zoom. Decisions in Slack. Documents in Google Drive. Context in people\'s heads. There is no single source of organizational truth.',
    stat: '143 conversations/week',
  },
  {
    icon: FileText, title: 'Context disappears',
    desc: 'A critical decision is made in a 30-minute call. The reasoning, trade-offs, and alternatives — gone the moment the call ends. Buried in an unread transcript.',
    stat: '87% of decisions undocumented',
  },
  {
    icon: Trash2, title: 'Institutional memory bleeds',
    desc: 'People leave. Teams restructure. Acquisitions happen. The context leaves with them. Every departure erases years of organizational knowledge.',
    stat: '42% knowledge loss per departure',
  },
  {
    icon: Repeat, title: 'History repeats itself',
    desc: 'Same questions, same debates, same decisions — made over and over. Organizations are condemned to repeat their cognitive history because nobody remembers it.',
    stat: '3.2x slower decision-making',
  },
]

function ProblemSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-36 relative">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-red-500/[0.03] to-transparent rounded-full pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto">
        <SectionEyebrow label="The Problem" tag="Enterprise" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]"
        >
          Organizations don&apos;t lose <span className="text-white/50">files</span>.
          <br />
          They lose <span className="text-accent">context</span>.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-white/50 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
        >
          Every decision made without context. Every question re-asked. Every new hire starting from zero. 
          The cost of organizational amnesia is invisible — but it&apos;s the most expensive line item never tracked.
        </motion.p>
      </div>

      {/* Cost stats */}
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        {costCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="glass-card rounded-xl px-5 py-4 text-center min-w-[200px] flex-1 max-w-[280px]"
          >
            <card.icon className="w-5 h-5 mx-auto mb-2" style={{ color: card.color }} />
            <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Narrative cards */}
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
              <span className="text-[10px] font-mono text-white/20">{card.stat}</span>
            </div>
            <h3 className="text-sm font-semibold text-white/80">{card.title}</h3>
            <p className="mt-2 text-xs text-white/50 leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────
   Section 2 — Why Existing AI Meeting Apps Fail
   ─────────────────────────────────────────── */
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

function ComparisonSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-36 border-t border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto">
        <SectionEyebrow label="The Gap" tag="Comparison" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]"
        >
          Meeting apps capture <span className="text-white/50">words</span>.
          <br />
          Memory Engine captures <span className="text-accent">meaning</span>.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-white/50 max-w-lg mx-auto text-sm"
        >
          The difference between a transcript archive and a living organizational brain.
        </motion.p>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-start justify-center gap-8 md:gap-16">
        {/* Traditional: dead pipeline */}
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
              <span className="text-[10px] font-mono text-red-400/60">Knowledge decay: 100%</span>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="hidden md:flex flex-col items-center gap-2 pt-12">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="w-10 h-10 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center"
          >
            <Zap className="w-4 h-4 text-brand" />
          </motion.div>
          <div className="w-px h-12 bg-gradient-to-b from-brand/30 to-accent/30" />
          <span className="text-[9px] font-mono text-white/20 tracking-widest -rotate-90">VS</span>
        </div>

        {/* Memory Engine: living pipeline */}
        <div className="flex-1 max-w-[320px]">
          <ComparisonSide side="right" items={memoryPipeline} />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.06] border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400/60">Knowledge retention: continuous</span>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-12 glass-card rounded-2xl p-6 md:p-8 text-center max-w-2xl mx-auto"
      >
        <p className="text-sm text-white/70 leading-relaxed">
          <span className="text-white font-semibold">Traditional tools</span> treat meetings as standalone events. 
          <span className="text-accent font-semibold"> Memory Engine</span> treats every source as a node in a living knowledge graph — 
          connected, searchable, and permanently accessible through natural language.
        </p>
      </motion.div>
    </section>
  )
}

/* ───────────────────────────────────────────
   Section 3 — Powered by Cognee
   Premium animated architecture
   ─────────────────────────────────────────── */
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

function CogneeArchitecture() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-36 border-t border-white/[0.06] relative overflow-hidden">
      {/* Large background watermark */}
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
          className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]"
        >
          Powered by <span className="text-brand">Cognee</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-white/50 max-w-lg mx-auto text-sm"
        >
          From raw source to enterprise intelligence. Every layer purpose-built for persistent organizational memory.
        </motion.p>
      </div>

      {/* Architecture Flow - Desktop: horizontal, Mobile: vertical */}
      <div className="mt-16 relative z-10">
        {/* Desktop: horizontal pipeline */}
        <div className="hidden lg:flex flex-col items-center gap-6">
          {/* Pipeline nodes */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {cogneePipelineSteps.slice(0, 4).map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <PipelineNode icon={step.icon} label={step.label} highlight={step.highlight} delay={i * 0.06} />
                <ChevronRight className="w-3 h-3 text-white/15" />
              </div>
            ))}
          </div>

          {/* Cognee Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-card rounded-2xl p-5 md:p-6 border-brand/30 shadow-[0_0_40px_rgba(59,130,246,0.1)] min-w-[200px] text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Cpu className="w-6 h-6 text-brand" />
              <span className="text-lg font-bold text-white">Cognee</span>
            </div>
            <p className="text-[10px] text-white/40 font-mono">Entity Extraction · Graph Construction · Embedding Generation · Semantic Indexing</p>
          </motion.div>

          {/* Pipeline nodes after Cognee */}
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

        {/* Mobile: vertical steps */}
        <div className="lg:hidden space-y-3 max-w-sm mx-auto">
          {cogneePipelineSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.highlight ? 'bg-brand/10 border border-brand/30' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                <step.icon className={`w-4 h-4 ${step.highlight ? 'text-brand' : 'text-white/40'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium ${step.highlight ? 'text-white' : 'text-white/60'}`}>{step.label}</p>
              </div>
              <span className="text-[9px] font-mono text-white/20">{String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto relative z-10"
      >
        {[
          { value: '99.7%', label: 'Entity recall accuracy' },
          { value: '<200ms', label: 'Semantic query latency' },
          { value: '12.8K', label: 'Knowledge objects indexed' },
          { value: '18.9K', label: 'Graph connections mapped' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-lg px-4 py-3 text-center">
            <p className="text-lg font-bold text-white/90">{stat.value}</p>
            <p className="text-[9px] text-white/40 mt-0.5 font-mono">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

/* ───────────────────────────────────────────
   Section 4 — Ask Your Organization
   ─────────────────────────────────────────── */
const queryResults = [
  { icon: GitBranch, label: 'Decision', value: 'Enterprise pricing set at $49/user/month. Approved by Rahul S. and leadership team.', color: brand },
  { icon: Camera, label: 'Source', value: 'Q3 Strategy Session — June 18, 2026 — 12 participants', color: '#8B5CF6' },
  { icon: Users, label: 'People Involved', value: 'Rahul S. (VP Product), Sarah C. (CFO), Marcus J. (Sales)', color: '#22D3EE' },
  { icon: Folder, label: 'Related Projects', value: 'Pricing Strategy · Q3 2026 · Enterprise Tier Launch', color: '#10B981' },
]

function QuerySection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-36 border-t border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto">
        <SectionEyebrow label="Interface" tag="Natural Language" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]"
        >
          Instead of searching transcripts...
          <br />
          <span className="text-accent">ask your organization</span>
        </motion.h2>
      </div>

      {/* Query Demo */}
      <div className="mt-12 max-w-3xl mx-auto">
        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-4 md:p-6 mb-6 border-accent/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-mono text-white/90 bg-white/[0.03] px-4 py-2.5 rounded-xl border border-white/[0.06]">
                &ldquo;What pricing decision was made for Enterprise customers?&rdquo;
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cognee retrieved 4 results in 187ms
          </div>
        </motion.div>

        {/* Results */}
        <div className="space-y-2">
          {queryResults.map((r, i) => (
            <QueryResult key={r.label} icon={r.icon} label={r.label} value={r.value} color={r.color} delay={0.2 + i * 0.08} />
          ))}
        </div>

        {/* Reasoning + References */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 grid md:grid-cols-2 gap-4"
        >
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-brand" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Reasoning Trail</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Decision was reached after comparing Stripe, Braintree, and Adyen pricing models. 
              Rahul recommended Stripe Connect based on volume discounts. Sarah approved the $49/user/month tier contingent on annual commitment.
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">3 References</span>
            </div>
            <div className="space-y-1.5">
              {[
                'Stripe Pricing Comparison — v2.3 (PDF)',
                'Q2 Board Deck — Pricing Slides (Slides)',
                'Customer Feedback — Enterprise Tier (Notion)',
              ].map((ref, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-white/50">
                  <FileText className="w-3 h-3 text-white/20" />
                  {ref}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────
   Section 5 — Organizational Knowledge Graph
   ─────────────────────────────────────────── */
const orgKgNodes = [
  { label: 'People', icon: Users, count: '74', x: 50, y: 8, color: '#F59E0B' },
  { label: 'Projects', icon: Folder, count: '26', x: 85, y: 25, color: '#10B981' },
  { label: 'Meetings', icon: Camera, count: '143', x: 85, y: 58, color: '#8B5CF6' },
  { label: 'Decisions', icon: GitBranch, count: '91', x: 50, y: 78, color: brand },
  { label: 'Customers', icon: Building, count: '18', x: 15, y: 58, color: '#EF4444' },
  { label: 'Repositories', icon: Code, count: '47', x: 15, y: 25, color: '#22D3EE' },
  { label: 'Documents', icon: FileText, count: '1.2K', x: 50, y: 92, color: '#EC4899' },
  { label: 'Actions', icon: Check, count: '218', x: 50, y: 92, color: '#F59E0B' },
]

function OrgKnowledgeGraph() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-36 border-t border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto">
        <SectionEyebrow label="Architecture" tag="Knowledge Graph" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]"
        >
          Your organization as a <span className="text-accent">living graph</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-white/50 max-w-lg mx-auto text-sm"
        >
          Every entity, relationship, and decision — connected and queryable. Cognee maps your entire organizational landscape.
        </motion.p>
      </div>

      {/* Knowledge Graph Visualization */}
      <div className="mt-12 relative h-[400px] md:h-[500px] glass-card rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/[0.02] to-transparent pointer-events-none" />
        
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <radialGradient id="center-glow"><stop offset="0%" stopColor={brand} stopOpacity="0.2" /><stop offset="100%" stopColor={brand} stopOpacity="0" /></radialGradient>
          </defs>
          <circle cx="50%" cy="46%" r="120" fill="url(#center-glow)" />
          {(() => {
            const nodePositions = [
              { x: 50, y: 8 }, { x: 85, y: 25 }, { x: 85, y: 58 }, { x: 50, y: 78 },
              { x: 15, y: 58 }, { x: 15, y: 25 }, { x: 50, y: 92 },
            ]
            return nodePositions.map((pos, i) => (
              <line key={i} x1="50%" y1="46%" x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
            ))
          })()}
          {/* Inter-node connections */}
          <line x1="85%" y1="25%" x2="85%" y2="58%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="15%" y1="25%" x2="15%" y2="58%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="50%" y1="8%" x2="50%" y2="78%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        </svg>

        {/* Center node: Cognee */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-brand/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Cpu className="w-8 h-8 text-brand" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/60">Cognee</span>
        </motion.div>

        {/* Orbiting nodes */}
        {orgKgNodes.map((node, i) => {
          const angle = (i * 50) * (Math.PI / 180)
          const ox = Math.cos(angle) * 35
          const oy = Math.sin(angle) * 28
          return (
            <motion.div
              key={node.label}
              className="absolute flex flex-col items-center gap-1 group cursor-pointer z-10"
              style={{ left: `calc(50% + ${ox}%)`, top: `calc(46% + ${oy}%)` }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.15 }}
            >
              <div className="w-11 h-11 rounded-xl bg-surface-elevated border border-white/10 flex items-center justify-center group-hover:border-brand/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
                <node.icon className="w-5 h-5 text-white/60 group-hover:text-brand transition-colors" />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 group-hover:text-white/70 transition-colors">{node.label}</span>
              <span className="text-sm font-bold text-white/80">{node.count}</span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────
   Section 6 — Enterprise Intelligence Dashboard
   ─────────────────────────────────────────── */
/* ───────────────────────────────────────────
   Section 7 — Enterprise Security
   ─────────────────────────────────────────── */
const securityCards = [
  { icon: Shield, title: 'SOC2 Type II', desc: 'Certified and audited annually' },
  { icon: Lock, title: 'End-to-End Encryption', desc: 'AES-256 at rest and in transit' },
  { icon: Users, title: 'Role-Based Access', desc: 'Granular permissions and SSO' },
  { icon: ClipboardList, title: 'Audit Trail', desc: 'Every action immutably logged' },
  { icon: Code, title: 'API Access', desc: 'REST & GraphQL with rate limiting' },
  { icon: Server, title: 'Self-Hosted', desc: 'Deploy on your infrastructure' },
]

const techStack = ['Kafka', 'Postgres', 'Redis', 'Vector Search', 'Spring Boot', 'Docker']

function EnterpriseSecurity() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-36 border-t border-white/[0.06]">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionEyebrow label="Security" tag="Enterprise" />
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
            Enterprise-grade security <br />&amp; compliance.
          </h2>
          <p className="mt-4 text-white/50 max-w-md text-sm leading-relaxed">
            Built for organizations that can&apos;t compromise. Every byte encrypted, every action logged, every access controlled. Your organizational memory stays yours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {techStack.map(tech => (
              <div key={tech} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                <span className="text-[10px] font-mono text-white/30">{tech}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          {securityCards.map(card => (
            <div key={card.title} className="glass-card rounded-xl p-4">
              <card.icon className="w-5 h-5 text-brand" />
              <h3 className="text-sm font-semibold text-white/80 mt-2">{card.title}</h3>
              <p className="text-xs text-white/40 mt-1">{card.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────
   Section 8 — Final CTA
   ─────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="glass-card relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(59,130,246,0.12), transparent 70%)', opacity: 0.5 }} />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center mx-auto mb-6"
          >
            <Brain className="w-8 h-8 text-brand" />
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
            Your organization<br />deserves a <span className="text-accent">memory</span>.
          </h2>
          <p className="mt-6 text-white/50 max-w-md mx-auto text-sm leading-relaxed">
            Join thousands of engineering leaders, product teams, and operators who treat organizational knowledge as infrastructure — not an afterthought.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NextLink href="/login"><PrimaryButton label="Book a Demo" size="lg" /></NextLink>
            <SecondaryButton>Start Free Trial</SecondaryButton>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ───────────────────────────────────────────
   Component — Pricing Section
   ─────────────────────────────────────────── */
const plans = [
  {
    name: 'Starter', price: 'Free', desc: 'For small teams exploring enterprise memory.',
    features: ['Up to 10 sources/month', 'Basic semantic search', '3 team members', 'Web access', 'Community support'],
    popular: false, cta: 'Get Started',
  },
  {
    name: 'Business', price: '$49', desc: 'For growing teams that need serious organizational memory.',
    features: ['Unlimited sources', 'Advanced semantic search', '25 team members', 'API access', 'Priority support', 'Cognee knowledge graph'],
    popular: true, cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise', price: 'Custom', desc: 'For organizations that need complete control over their memory infrastructure.',
    features: ['Unlimited everything', 'Custom Cognee models', 'SSO & SCIM', 'Dedicated infrastructure', 'SLA guarantee', 'White-glove onboarding'],
    popular: false, pro: true, cta: 'Contact Sales',
  },
]

function PricingSection({ yearly, setYearly }: { yearly: boolean; setYearly: (v: boolean) => void }) {
  return (
    <section className="c3-pricing-section border-t border-white/[0.06]" id="pricing">
      <div className="c3-watermark-container">
        <div className="c3-watermark-main">
          <span className="c3-watermark-line-1">Enterprise</span>
          <span className="c3-watermark-line-2">Intelligence</span>
        </div>
      </div>
      <div className="c3-toggle-wrap">
        <span className="text-xs text-white/40 font-mono">Monthly</span>
        <button className={`c3-toggle ${yearly ? 'active' : ''}`} onClick={() => setYearly(!yearly)}>
          <div className="c3-toggle-knob" />
        </button>
        <span className="text-xs text-white/40 font-mono">Yearly</span>
      </div>
      <motion.div
        className="c3-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            className={`c3-card ${plan.pro ? 'c3-card-pro' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-4 right-4 rounded-full bg-brand text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                Most Popular
              </div>
            )}
            <div className="c3-tier-small">{plan.name}</div>
            <div className="c3-tier-large">
              {plan.price === 'Custom' ? 'Custom' : yearly ? (
                <>{plan.name === 'Business' ? '$499' : plan.price}<span className="text-base text-white/40 ml-1">/yr</span></>
              ) : (
                <>{plan.price}<span className="text-base text-white/40 ml-1">/mo</span></>
              )}
            </div>
            <div className="c3-desc">{plan.desc}</div>
            <ul className="c3-list">
              {plan.features.map(f => (
                <li key={f}>
                  <span className="c3-check"><Check className="w-3 h-3" /></span>
                  {f}
                </li>
              ))}
            </ul>
            <NextLink href="/login" className="c3-btn no-underline text-center">
              {plan.cta}
            </NextLink>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ───────────────────────────────────────────
   Component — Hero Product Preview
   ─────────────────────────────────────────── */
function HeroProductPreview() {
  const previewRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotateX(-y * 4)
    setRotateY(x * 4)
  }

  const onMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 w-full max-w-5xl relative"
      ref={previewRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        perspective: '1000px',
      }}
    >
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(13,17,23,0.5)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 80px rgba(59,130,246,0.1)',
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 h-10 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-[11px] font-mono text-white/40">Memory Engine — Enterprise Memory Platform</span>
          </div>
        </div>

        {/* Three-panel layout */}
        <div className="grid grid-cols-[280px_1fr_220px] h-[420px]">
          {/* Left — Enterprise Memory Chat */}
          <div className="border-r border-white/[0.06] p-3 flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.04]">
              <Brain className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-medium text-white/70">Enterprise Memory</span>
              <span className="ml-auto text-[10px] font-mono text-white/30">Cognee</span>
            </div>
            <div className="space-y-3 flex-1 overflow-hidden">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-2.5 h-2.5 text-brand" />
                </div>
                <div className="rounded-xl bg-white/[0.04] px-3 py-2 text-[11px] text-white/70 leading-relaxed">
                  What pricing decision was made for Enterprise customers?
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-white">ME</span>
                </div>
                <div className="rounded-xl bg-brand/10 border border-brand/20 px-3 py-2 text-[11px] text-white/80 leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="text-[10px] font-medium text-accent">Memory Retrieved</span>
                  </div>
                  Enterprise pricing was set at $49/user/month during the Q3 Strategy session. Decision logged with 96% confidence. 3 supporting references found.
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-[10px] text-white/40">Cognee retrieving related context...</span>
              </div>
            </div>
          </div>

          {/* Center — Search Results */}
          <div className="border-r border-white/[0.06] p-3 flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <Search className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[11px] text-white/30">Search organizational memory...</span>
            </div>
            <div className="text-[10px] font-mono text-white/30 tracking-wider uppercase">
              4 results · Sorted by Cognee relevance
            </div>
            <div className="space-y-2 flex-1 overflow-hidden">
              {[
                { icon: GitBranch, label: 'Decision', value: 'Enterprise Pricing: $49/user/month approved', color: brand, score: '96%' },
                { icon: Camera, label: 'Source', value: 'Q3 Strategy — June 18, 2026', color: '#8B5CF6', score: '92%' },
                { icon: Users, label: 'Person', value: 'Rahul S. — VP Product', color: '#22D3EE', score: '94%' },
                { icon: Folder, label: 'Project', value: 'Pricing Strategy · Q3 2026', color: '#10B981', score: '89%' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${item.color}15` }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-white/70">{item.label}</div>
                    <div className="text-[10px] text-white/40 truncate">{item.value}</div>
                  </div>
                  <span className="text-[10px] font-mono text-white/30">{item.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Timeline & References */}
          <div className="relative p-3 overflow-hidden bg-gradient-to-b from-white/[0.01] to-transparent flex flex-col gap-3">
            <div className="text-[10px] font-mono text-white/30 tracking-wider uppercase">Decision Timeline</div>
            <div className="space-y-2 flex-1">
              {[
                { label: 'Q3 Strategy Session', time: '2 weeks ago', active: true },
                { label: 'Pricing Committee', time: '1 week ago', active: true },
                { label: 'Executive Review', time: '3 days ago', active: true },
                { label: 'Final Approval', time: 'Yesterday', active: false },
              ].map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`w-2 h-2 rounded-full ${ev.active ? 'bg-brand shadow-[0_0_6px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
                    {i < 3 && <div className="w-px h-4 bg-white/[0.06]" />}
                  </div>
                  <div>
                    <p className={`text-[10px] ${ev.active ? 'text-white/60' : 'text-white/30'}`}>{ev.label}</p>
                    <p className="text-[9px] text-white/20">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-[9px] font-mono text-white/20 tracking-wider uppercase">3 References Found</p>
              <p className="text-[10px] text-white/40 mt-1 line-clamp-2">Stripe pricing doc v2, Q2 board deck, customer feedback summary</p>
            </div>
          </div>
        </div>
    </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Page — Welcome (Enterprise Memory Platform)
   ═══════════════════════════════════════════ */
export default function WelcomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [yearly, setYearly] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F9FAFB] selection:bg-brand/30 font-sans antialiased overflow-x-hidden">

      {/* ── Global SVG Filters ── */}
      <svg className="fixed w-0 h-0" aria-hidden>
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
        <filter id="c3-noise-pricing">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
          <feComponentTransfer><feFuncA type="linear" slope="0.075" /></feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      {/* ── Background Video ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#070B14]/60" />
      </div>

      {/* ── Noise Texture ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }} />

      {/* ── Vertical Guide Lines ── */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/[0.06] z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/[0.06] z-[5]" />

      {/* ── Content ── */}
      <div className="relative z-10">

        {/* ===== NAVBAR ===== */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled
              ? 'rgba(7, 11, 20, 0.85)'
              : 'rgba(7, 11, 20, 0)',
            backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'blur(0px)',
            WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'blur(0px)',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0)',
          }}
        >
          {scrolled && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          )}
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Logo className="w-[200px] h-[200px] text-white/80" />
            </div>
            <div className="hidden md:flex items-center gap-1">
              {['Product', 'Solutions', 'Pricing', 'Docs', 'Security'].map((link, i) => (
                <motion.a
                  key={link}
                  href={i === 2 ? '#pricing' : '#'}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  {link}
                </motion.a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <NextLink href="/login"><GhostButton>Sign in</GhostButton></NextLink>
              <NextLink href="/login"><PrimaryButton label="Start Free" size="sm" /></NextLink>
            </div>
            <button className="md:hidden w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-4 h-4 text-white/60" /> : <Menu className="w-4 h-4 text-white/60" />}
            </button>
          </div>
        </motion.header>

        {/* Mobile nav overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed inset-0 z-40 bg-[#070B14]/95 backdrop-blur-xl pt-20 md:hidden"
            >
              <div className="flex flex-col items-center gap-4 px-6">
                {['Product', 'Solutions', 'Pricing', 'Docs', 'Security'].map(link => (
                  <a key={link} href="#" className="text-lg font-medium text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>{link}</a>
                ))}
                <hr className="w-full border-white/10 my-4" />
                <NextLink href="/login"><PrimaryButton label="Start Free" /></NextLink>
                <NextLink href="/login"><GhostButton>Sign in</GhostButton></NextLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== HERO ===== */}
        <section className="pt-32 md:pt-40 pb-12 text-center flex flex-col items-center relative px-6 overflow-hidden">
          {/* Floating decorative orbs */}
          <motion.div
            className="absolute top-20 left-[10%] w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)' }}
            animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-40 right-[15%] w-80 h-80 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)' }}
            animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute bottom-10 left-[30%] w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }}
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          {/* Subtle gradient mesh background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/[0.03] via-accent/[0.02] to-transparent rounded-full blur-3xl" />
          </div>
          <TrustBar />
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] max-w-4xl"
          >
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
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="block text-white/80 text-2xl md:text-4xl lg:text-5xl font-normal mt-4"
            >
              Every decision, conversation, and document
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="block text-white/80 text-2xl md:text-4xl lg:text-5xl font-normal"
            >
              becomes permanently queryable
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="animate-shiny block text-5xl md:text-7xl lg:text-8xl mt-2" style={heroGradientStyle}
            >
              Intelligence
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 text-white/50 max-w-xl text-base md:text-lg leading-relaxed"
          >
            Memory Engine is the category-defining Enterprise Memory Platform. Powered by Cognee, it transforms every source of organizational knowledge into a connected, searchable, permanently accessible intelligence layer. The brain your enterprise never had.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3"
          >
            <NextLink href="/login"><PrimaryButton label="Book a Demo" size="lg" /></NextLink>
            <SecondaryButton>
              <Play className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              Watch 2-min demo
            </SecondaryButton>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-4 text-xs text-white/30 flex items-center gap-4"
          >
            {['SOC2 Type II certified', 'End-to-end encrypted', 'GDPR compliant'].map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                {item}
              </motion.span>
            ))}
          </motion.div>
          <HeroProductPreview />
        </section>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex flex-col items-center gap-2 pb-8"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
          >
            <motion.div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Scroll to explore</span>
        </motion.div>

        {/* ===== LOGO CLOUD ===== */}
        <section className="max-w-6xl mx-auto px-6 py-12 border-y border-white/[0.06]">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/30 text-center mb-8">Trusted by teams at</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
            {['Linear', 'Vercel', 'Figma', 'Stripe', 'Notion', 'Datadog', 'Supabase', 'Raycast'].map((name, i) => (
              <motion.span
                key={name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="text-sm font-semibold tracking-tight text-white/30 hover:text-white/60 transition-colors text-center"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </section>

        {/* ===== SECTION 1: THE PROBLEM ===== */}
        <ProblemSection />

        {/* ===== SECTION 2: WHY EXISTING AI MEETING APPS FAIL ===== */}
        <ComparisonSection />

        {/* ===== SECTION 3: POWERED BY COGNEE ===== */}
        <CogneeArchitecture />

        {/* ===== SECTION 4: ASK YOUR ORGANIZATION ===== */}
        <QuerySection />

        {/* ===== SECTION 5: ORGANIZATIONAL KNOWLEDGE GRAPH ===== */}
        <OrgKnowledgeGraph />

        {/* ===== SECTION 6: ENTERPRISE INTELLIGENCE DASHBOARD ===== */}
        <DashboardPreview />

        {/* ===== SECTION 7: ENTERPRISE SECURITY ===== */}
        <EnterpriseSecurity />

        {/* ===== PRICING ===== */}
        <PricingSection yearly={yearly} setYearly={setYearly} />

        {/* ===== SECTION 8: FINAL CTA ===== */}
        <FinalCTA />

        {/* ===== FOOTER ===== */}
        <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Logo className="w-[200px] h-[200px] text-white/80" />
              </div>
              <p className="mt-1 text-xs text-white/30">Enterprise Memory Platform · Powered by Cognee</p>
            </div>
            <div>
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2">Stay updated</p>
              <div className="flex gap-2">
                <input type="email" placeholder="you@company.com" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 transition-all duration-300 focus:outline-none focus:border-brand/50 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] w-48" />
                <button className="bg-brand text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand/90 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-[0.97] transition-all duration-300">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'API', 'Status'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
              { title: 'Resources', links: ['Documentation', 'Guides', 'Changelog', 'Community'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'DPA'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold tracking-wider text-white/50 mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">&copy; 2026 Memory Engine. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <svg className="w-4 h-4 text-white/30 hover:text-white/60 cursor-pointer transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <svg className="w-4 h-4 text-white/30 hover:text-white/60 cursor-pointer transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <svg className="w-4 h-4 text-white/30 hover:text-white/60 cursor-pointer transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
