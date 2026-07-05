'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Brain, Users, Calendar, GitBranch, ClipboardCheck,
  MessageSquare, FolderOpen, Network, ZoomIn, ZoomOut,
  RotateCcw,
} from 'lucide-react'
import { DEMO } from '@/lib/demo-data'

interface GraphNode {
  id: string
  label: string
  type: 'center' | 'entity'
  group: string
  connections: number
  x: number
  y: number
}

const nodes: GraphNode[] = [
  { id: 'center', label: 'Memory Engine', type: 'center', group: 'center', connections: 7, x: 200, y: 140 },
  { id: 'meetings', label: `${DEMO.meetings} Meetings`, type: 'entity', group: 'meetings', connections: 42, x: 80, y: 40 },
  { id: 'people', label: `${DEMO.people} People`, type: 'entity', group: 'people', connections: 74, x: 340, y: 50 },
  { id: 'memories', label: `${(DEMO.memories / 1000).toFixed(1)}K Memories`, type: 'entity', group: 'memories', connections: 128, x: 40, y: 150 },
  { id: 'decisions', label: `${DEMO.decisions} Decisions`, type: 'entity', group: 'decisions', connections: 91, x: 360, y: 140 },
  { id: 'actions', label: `${DEMO.actionItems} Actions`, type: 'entity', group: 'actions', connections: 218, x: 80, y: 240 },
  { id: 'projects', label: `${DEMO.projects} Projects`, type: 'entity', group: 'projects', connections: 26, x: 340, y: 230 },
  { id: 'connections', label: `${(DEMO.knowledgeConnections / 1000).toFixed(0)}K Connections`, type: 'entity', group: 'connections', connections: 18902, x: 200, y: 40 },
]

const groupColors: Record<string, string> = {
  center: '#4F8BFF',
  meetings: '#4F8BFF',
  people: '#10B981',
  memories: '#F59E0B',
  decisions: '#8C6BFF',
  actions: '#EF4444',
  projects: '#4F8BFF',
  connections: '#00D4FF',
}

const groupIcons: Record<string, React.ElementType> = {
  center: Brain,
  meetings: Calendar,
  people: Users,
  memories: FolderOpen,
  decisions: GitBranch,
  actions: ClipboardCheck,
  projects: Network,
  connections: MessageSquare,
}

const brand = '#4F8BFF'
const accent = '#00D4FF'
const purple = '#8C6BFF'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

export function KnowledgeGraph() {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const p: Particle[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 400,
      y: Math.random() * 280,
      size: 1 + Math.random() * 2,
      color: [brand, accent, purple][i % 3],
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    }))
    setParticles(p)
  }, [])

  const edges: [string, string][] = [
    ['center', 'meetings'],
    ['center', 'people'],
    ['center', 'memories'],
    ['center', 'decisions'],
    ['center', 'actions'],
    ['center', 'projects'],
    ['center', 'connections'],
    ['meetings', 'people'],
    ['meetings', 'memories'],
    ['meetings', 'decisions'],
    ['meetings', 'actions'],
    ['people', 'projects'],
    ['decisions', 'actions'],
    ['memories', 'connections'],
  ]

  return (
    <div className="relative w-full h-[320px] overflow-hidden rounded-xl bg-gradient-to-br from-primary/[0.02] to-transparent">
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
          className="rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-background transition-all shadow-sm"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
          className="rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-background transition-all shadow-sm"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => { setZoom(1); setSelected(null) }}
          className="rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-background transition-all shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 320"
        className="w-full h-full transition-transform duration-300"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', cursor: 'pointer' }}
      >
        <defs>
          <radialGradient id="centerGlowKG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`${brand}40`} />
            <stop offset="100%" stopColor={`${brand}00`} />
          </radialGradient>
          <linearGradient id="edgeGradKG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`${brand}30`} />
            <stop offset="50%" stopColor={`${accent}20`} />
            <stop offset="100%" stopColor={`${purple}30`} />
          </linearGradient>
          {[...new Set(edges.flat())].map((id) => {
            const node = nodes.find((n) => n.id === id)
            if (!node) return null
            return (
              <radialGradient key={id} id={`glow-${id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={groupColors[node.group]} stopOpacity="0.3" />
                <stop offset="100%" stopColor={groupColors[node.group]} stopOpacity="0" />
              </radialGradient>
            )
          })}
        </defs>

        <circle cx="200" cy="140" r="130" fill="url(#centerGlowKG)" />

        {/* Particles */}
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={p.color}
            opacity={0.4}
            animate={{
              y: [p.y, p.y - 40 - Math.random() * 30, p.y],
              x: [p.x, p.x + (Math.random() - 0.5) * 30, p.x],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Animated edges with flowing effect */}
        {edges.map(([src, tgt], i) => {
          const s = nodes.find((n) => n.id === src)
          const t = nodes.find((n) => n.id === tgt)
          if (!s || !t) return null
          const isHighlighted = selected === null || selected === src || selected === tgt
          return (
            <g key={i}>
              <line
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={isHighlighted ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)'}
                strokeWidth={isHighlighted ? 1.5 : 0.5}
                className="transition-all duration-500"
              />
              <motion.line
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke="url(#edgeGradKG)"
                strokeWidth={isHighlighted ? 1 : 0.5}
                strokeDasharray="200"
                initial={{ strokeDashoffset: 200 }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: i * 0.1, ease: 'linear' }}
              />
            </g>
          )
        })}

        {nodes.map((node) => {
          const isCenter = node.type === 'center'
          const isSelected = selected === node.id || selected === null
          const isHovered = hovered === node.id
          const r = isCenter ? 32 : 22 + Math.min(node.connections / 20, 8)
          const Icon = groupIcons[node.group]

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(selected === node.id ? null : node.id)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={r + (isHovered ? 5 : 0)}
                fill={isSelected ? groupColors[node.group] : 'rgba(255,255,255,0.03)'}
                stroke={groupColors[node.group]}
                strokeWidth={isSelected ? 2 : 0.5}
                opacity={isSelected ? 1 : 0.3}
                className="transition-all duration-300"
              />
              {isCenter && (
                <>
                  <motion.circle
                    cx={node.x} cy={node.y} r={r + 10}
                    fill="none" stroke={`${brand}30`} strokeWidth="1"
                    animate={{ r: [r + 10, r + 15, r + 10], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.circle
                    cx={node.x} cy={node.y} r={r + 20}
                    fill="none" stroke={`${brand}20`} strokeWidth="0.5"
                    animate={{ r: [r + 20, r + 28, r + 20], opacity: [0.2, 0.05, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  />
                  <motion.circle
                    cx={node.x} cy={node.y} r={r + 32}
                    fill="none" stroke={`${brand}10`} strokeWidth="0.5"
                    animate={{ r: [r + 32, r + 42, r + 32], opacity: [0.1, 0.03, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  />
                </>
              )}
              <foreignObject
                x={node.x - 12}
                y={node.y - 12}
                width="24"
                height="24"
              >
                <div className="flex items-center justify-center w-full h-full text-white">
                  <Icon className={`w-4 h-4 ${isCenter ? 'w-5 h-5' : ''}`} />
                </div>
              </foreignObject>
              {!isCenter && (
                <foreignObject
                  x={node.x - 45}
                  y={node.y + r + 4}
                  width="90"
                  height="20"
                >
                  <div className={`text-center text-[8px] font-medium transition-all duration-300 ${isSelected ? 'text-white/80' : 'text-white/30'}`}>
                    {node.label}
                  </div>
                </foreignObject>
              )}
            </g>
          )
        })}
      </svg>

      <AnimatePresence>
        {selected && selected !== 'center' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute top-10 right-2 glass rounded-xl p-3 text-xs max-w-[180px] shadow-xl"
          >
            <p className="font-medium text-white/90 mb-1">{nodes.find((n) => n.id === selected)?.label}</p>
            <p className="text-white/50 text-[10px]">Connections: {nodes.find((n) => n.id === selected)?.connections}</p>
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-white/40 text-[9px]">Click to deselect</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
