'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Users, Folder, Camera, GitBranch, Building, Code,
  FileText, Check, Cpu,
} from 'lucide-react'
import { SectionEyebrow } from './section-eyebrow'

const brand = '#4F8BFF'
const accent = '#00D4FF'
const purple = '#8C6BFF'

const orgKgNodes = [
  { label: 'People', icon: Users, count: '74', x: 50, y: 8, color: '#F59E0B' },
  { label: 'Projects', icon: Folder, count: '26', x: 85, y: 25, color: '#10B981' },
  { label: 'Meetings', icon: Camera, count: '143', x: 85, y: 58, color: purple },
  { label: 'Decisions', icon: GitBranch, count: '91', x: 50, y: 78, color: brand },
  { label: 'Customers', icon: Building, count: '18', x: 15, y: 58, color: '#EF4444' },
  { label: 'Repositories', icon: Code, count: '47', x: 15, y: 25, color: accent },
  { label: 'Documents', icon: FileText, count: '1.2K', x: 50, y: 92, color: '#EC4899' },
  { label: 'Actions', icon: Check, count: '218', x: 50, y: 92, color: '#F59E0B' },
]

export function KnowledgeGraphSection() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-44 border-t border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto">
        <SectionEyebrow label="Architecture" tag="Knowledge Graph" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 section-title"
        >
          Your organization as a <span className="gradient-text-cyan">living graph</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 body-text text-white/50 max-w-lg mx-auto"
        >
          Every entity, relationship, and decision — connected and queryable. Cognee maps your entire organizational landscape.
        </motion.p>
      </div>

      <div className="mt-16 relative h-[450px] md:h-[550px] glass-card-premium rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/[0.02] to-transparent pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: [brand, accent, purple][i % 3],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 40, 0],
                x: [0, (Math.random() - 0.5) * 30, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <radialGradient id="center-glow">
              <stop offset="0%" stopColor={brand} stopOpacity="0.25" />
              <stop offset="100%" stopColor={brand} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={brand} stopOpacity="0.15" />
              <stop offset="50%" stopColor={accent} stopOpacity="0.1" />
              <stop offset="100%" stopColor={purple} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <circle cx="50%" cy="46%" r="140" fill="url(#center-glow)" />

          {(() => {
            const positions = [
              { x: 50, y: 8 }, { x: 85, y: 25 }, { x: 85, y: 58 }, { x: 50, y: 78 },
              { x: 15, y: 58 }, { x: 15, y: 25 }, { x: 50, y: 92 },
            ]
            return positions.map((pos, i) => (
              <g key={i}>
                <line x1="50%" y1="46%" x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                <motion.line
                  x1="50%" y1="46%" x2={`${pos.x}%`} y2={`${pos.y}%`}
                  stroke="url(#edge-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  whileInView={{ strokeDashoffset: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: i * 0.2, ease: 'linear' }}
                />
              </g>
            ))
          })()}
          <line x1="85%" y1="25%" x2="85%" y2="58%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="15%" y1="25%" x2="15%" y2="58%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="50%" y1="8%" x2="50%" y2="78%" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        </svg>

        {/* Pulsing center node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `${brand}30`,
                filter: 'blur(20px)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="w-16 h-16 rounded-2xl relative flex items-center justify-center border"
              style={{
                backgroundColor: '#0E121C',
                borderColor: `${brand}30`,
                boxShadow: `0 0 30px ${brand}30`,
              }}
            >
              <Cpu className="w-8 h-8" style={{ color: brand }} />
            </div>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/60">Cognee</span>
        </motion.div>

        {/* Orbiting nodes */}
        {orgKgNodes.map((node, i) => {
          const angle = (i * 50) * (Math.PI / 180)
          const ox = Math.cos(angle) * 35
          const oy = Math.sin(angle) * 28
          const isHovered = hoveredNode === node.label

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
              onMouseEnter={() => setHoveredNode(node.label)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300"
                style={{
                  backgroundColor: isHovered ? `${node.color}20` : '#0E121C',
                  borderColor: isHovered ? `${node.color}50` : 'rgba(255,255,255,0.1)',
                  boxShadow: isHovered ? `0 0 20px ${node.color}30` : 'none',
                }}
                animate={isHovered ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <node.icon className="w-5 h-5 transition-colors" style={{ color: isHovered ? node.color : 'rgba(255,255,255,0.6)' }} />
              </motion.div>
              <span className="text-[9px] font-mono uppercase tracking-wider transition-colors" style={{ color: isHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>
                {node.label}
              </span>
              <motion.span
                className="text-sm font-bold text-white/80"
                animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {node.count}
              </motion.span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
