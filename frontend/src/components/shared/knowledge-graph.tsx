'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  center: 'oklch(0.546 0.245 262.881)',
  meetings: 'oklch(0.546 0.245 262.881 / 0.7)',
  people: 'oklch(0.696 0.17 162.48 / 0.7)',
  memories: 'oklch(0.769 0.188 70.08 / 0.7)',
  decisions: 'oklch(0.627 0.265 303.9 / 0.7)',
  actions: 'oklch(0.645 0.246 16.439 / 0.7)',
  projects: 'oklch(0.488 0.243 264.376 / 0.7)',
  connections: 'oklch(0.6 0.118 184.704 / 0.7)',
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

export function KnowledgeGraph() {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

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
    <div className="relative w-full h-[300px] overflow-hidden rounded-xl bg-gradient-to-br from-primary/[0.02] to-transparent">
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
        viewBox="0 0 400 280"
        className="w-full h-full transition-transform duration-300"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', cursor: 'pointer' }}
      >
        <defs>
          <radialGradient id="centerGlowKG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.546 0.245 262.881 / 0.25)" />
            <stop offset="100%" stopColor="oklch(0.546 0.245 262.881 / 0)" />
          </radialGradient>
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

        <circle cx="200" cy="140" r="120" fill="url(#centerGlowKG)" />

        {edges.map(([src, tgt], i) => {
          const s = nodes.find((n) => n.id === src)
          const t = nodes.find((n) => n.id === tgt)
          if (!s || !t) return null
          const isHighlighted = selected === null || selected === src || selected === tgt
          return (
            <line
              key={i}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={isHighlighted ? 'oklch(1 0 0 / 0.12)' : 'oklch(1 0 0 / 0.03)'}
              strokeWidth={isHighlighted ? 1.5 : 0.5}
              className="transition-all duration-500"
            />
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
                fill={isSelected ? groupColors[node.group] : 'oklch(1 0 0 / 0.03)'}
                stroke={groupColors[node.group]}
                strokeWidth={isSelected ? 2 : 0.5}
                opacity={isSelected ? 1 : 0.3}
                className="transition-all duration-300"
              />
              {isCenter && (
                <>
                  <circle cx={node.x} cy={node.y} r={r + 10} fill="none" stroke="oklch(0.546 0.245 262.881 / 0.2)" strokeWidth="1" className="animate-pulse-soft" />
                  <circle cx={node.x} cy={node.y} r={r + 20} fill="none" stroke="oklch(0.546 0.245 262.881 / 0.1)" strokeWidth="0.5" className="animate-pulse-soft" style={{ animationDelay: '1s' }} />
                  <circle cx={node.x} cy={node.y} r={r + 32} fill="none" stroke="oklch(0.546 0.245 262.881 / 0.05)" strokeWidth="0.5" className="animate-pulse-soft" style={{ animationDelay: '2s' }} />
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
