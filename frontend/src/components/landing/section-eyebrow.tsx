'use client'

import { motion } from 'motion/react'

const accent = '#00D4FF'

interface SectionEyebrowProps {
  label: string
  tag?: string
  className?: string
}

export function SectionEyebrow({ label, tag, className = '' }: SectionEyebrowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,212,255,0.5)]" style={{ backgroundColor: accent }} />
      <span className="text-xs font-mono uppercase tracking-[0.15em] text-white/50">{label}</span>
      {tag && (
        <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-mono uppercase tracking-wider text-white/40">
          {tag}
        </span>
      )}
    </motion.div>
  )
}
