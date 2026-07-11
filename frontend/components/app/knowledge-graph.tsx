'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import { graphApi } from '@/lib/api/graph'
import { getErrorMessage } from '@/lib/api/client'
import type { GraphNode, GraphEdge } from '@/types/api'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Loader2,
  X,
  Network,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EntityPanel } from './entity-panel'

interface SimNode extends SimulationNodeDatum {
  id: string
  label: string
  type: string
  radius: number
  color: string
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  relationship: string
  confidence: number
}

const NODE_COLORS: Record<string, string> = {
  PERSON: '#3b82f6',
  TECHNOLOGY: '#8b5cf6',
  ORGANIZATION: '#f59e0b',
  PRODUCT: '#10b981',
  PROJECT: '#06b6d4',
  DATE: '#f43f5e',
  ENTITY: '#6b7280',
}

const EDGE_COLORS: Record<string, string> = {
  owns: '#3b82f6',
  assigned: '#f59e0b',
  works_on: '#10b981',
  replaced_by: '#ef4444',
  participates_in: '#8b5cf6',
}

const DEFAULT_EDGE_COLOR = '#6b7280'

interface KnowledgeGraphProps {
  initialEntity?: string
  meetingId?: string
}

export function KnowledgeGraph({ initialEntity, meetingId }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null)
  const nodesRef = useRef<SimNode[]>([])
  const linksRef = useRef<SimLink[]>([])
  const transformRef = useRef({ x: 0, y: 0, k: 1 })
  const dragRef = useRef<{ node: SimNode | null; active: boolean }>({ node: null, active: false })
  const hoveredRef = useRef<SimNode | null>(null)
  const rafRef = useRef<number>(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawNodes, setRawNodes] = useState<GraphNode[]>([])
  const [rawEdges, setRawEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [nodeCount, setNodeCount] = useState(0)
  const [edgeCount, setEdgeCount] = useState(0)

  const entityTypes = Array.from(new Set(rawNodes.map((n) => n.type)))

  const getNodeRadius = useCallback((mentionCount: number) => {
    return Math.max(8, Math.min(28, 6 + mentionCount * 2))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let res
        if (meetingId) {
          res = await graphApi.getByMeeting(meetingId)
        } else if (initialEntity) {
          res = await graphApi.getByEntity(initialEntity)
        } else {
          res = await graphApi.getFull()
        }
        setRawNodes(res.data.nodes)
        setRawEdges(res.data.edges)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialEntity, meetingId])

  useEffect(() => {
    if (loading || error || rawNodes.length === 0) return

    const filtered = rawNodes.filter(
      (n) => typeFilter.size === 0 || typeFilter.has(n.type)
    )
    const filteredIds = new Set(filtered.map((n) => n.id))

    const edges = rawEdges.filter((e) => {
      const s = e.source.toLowerCase().replace(/\s+/g, '_')
      const t = e.target.toLowerCase().replace(/\s+/g, '_')
      return filteredIds.has(s) && filteredIds.has(t)
    })

    if (filtered.length === 0) {
      setNodeCount(0)
      setEdgeCount(0)
      nodesRef.current = []
      linksRef.current = []
      if (simRef.current) simRef.current.stop()
      drawEmpty()
      return
    }

    setNodeCount(filtered.length)
    setEdgeCount(edges.length)

    const nodeMap = new Map<string, GraphNode>()
    filtered.forEach((n) => nodeMap.set(n.id, n))

    const simNodes: SimNode[] = filtered.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      radius: getNodeRadius(n.mentionCount),
      color: NODE_COLORS[n.type] || NODE_COLORS.ENTITY,
      x: Math.random() * 600 - 300,
      y: Math.random() * 600 - 300,
    }))

    const simLinks: SimLink[] = edges.map((e) => {
      const sourceId = e.source.toLowerCase().replace(/\s+/g, '_')
      const targetId = e.target.toLowerCase().replace(/\s+/g, '_')
      if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) return null
      return {
        source: sourceId,
        target: targetId,
        relationship: e.relationship,
        confidence: e.confidence,
      }
    }).filter(Boolean) as SimLink[]

    nodesRef.current = simNodes
    linksRef.current = simLinks

    if (simRef.current) simRef.current.stop()

    const sim = forceSimulation<SimNode>(simNodes)
      .force('link', forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(120))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide<SimNode>().radius((d) => d.radius + 4).strength(0.7))

    sim.on('tick', () => {
      draw()
    })

    simRef.current = sim

    return () => {
      sim.stop()
    }
  }, [rawNodes, rawEdges, typeFilter, loading, error, getNodeRadius])

  function drawEmpty() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  function worldToScreen(wx: number, wy: number): [number, number] {
    const t = transformRef.current
    const canvas = canvasRef.current
    if (!canvas) return [0, 0]
    const cx = canvas.width / 2 + (wx - canvas.width / 2) * t.k + t.x
    const cy = canvas.height / 2 + (wy - canvas.height / 2) * t.k + t.y
    return [cx, cy]
  }

  function screenToWorld(sx: number, sy: number): [number, number] {
    const t = transformRef.current
    const canvas = canvasRef.current
    if (!canvas) return [0, 0]
    const wx = (sx - canvas.width / 2 - t.x) / t.k + canvas.width / 2
    const wy = (sy - canvas.height / 2 - t.y) / t.k + canvas.height / 2
    return [wx, wy]
  }

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    const t = transformRef.current
    const nodes = nodesRef.current
    const links = linksRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)

    ctx.translate(t.x, t.y)
    ctx.translate(w / 2, h / 2)
    ctx.scale(t.k, t.k)

    const visibleExtent = [
      (-w / 2 - 100) / t.k,
      (-h / 2 - 100) / t.k,
      (w / 2 + 100) / t.k,
      (h / 2 + 100) / t.k,
    ]

    const labelThreshold = 0.4
    const showLabels = t.k > labelThreshold

    // Draw edges
    ctx.strokeStyle = 'rgba(156,163,175,0.25)'
    ctx.lineWidth = 1
    for (const link of links) {
      const source = link.source as SimNode | undefined
      const target = link.target as SimNode | undefined
      if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) continue

      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)
      ctx.stroke()
    }

    // Draw nodes
    for (const node of nodes) {
      if (node.x === undefined || node.y === undefined) continue
      const { x, y, radius, color, label } = node

      if (x < visibleExtent[0] || x > visibleExtent[2] || y < visibleExtent[1] || y > visibleExtent[3]) continue

      const isHovered = hoveredRef.current?.id === node.id
      const isSelected = selectedNode?.id === node.id

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)

      ctx.fillStyle = color + 'CC'
      ctx.fill()

      if (isSelected) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3
        ctx.stroke()
      } else if (isHovered) {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      if (showLabels) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.font = `${Math.max(10, Math.min(14, radius * 0.8))}px ui-sans-serif, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(label, x, y + radius + 4)
      }
    }

    ctx.restore()
  }

  function resizeCanvas() {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
    draw()
  }

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const t = transformRef.current
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newK = Math.max(0.1, Math.min(5, t.k * delta))
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    t.x = mx - (mx - t.x) * (newK / t.k)
    t.y = my - (my - t.y) * (newK / t.k)
    t.k = newK
    draw()
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const [wx, wy] = screenToWorld(mx, my)

    const hitNode = findNodeAt(wx, wy)
    if (hitNode && hitNode.x !== undefined && hitNode.y !== undefined) {
      dragRef.current = { node: hitNode, active: true }
      hitNode.fx = hitNode.x
      hitNode.fy = hitNode.y
      if (simRef.current) simRef.current.alphaTarget(0.3).restart()
    } else {
      dragRef.current = { node: null, active: false }
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const [wx, wy] = screenToWorld(mx, my)

    if (dragRef.current.active && dragRef.current.node) {
      dragRef.current.node.fx = wx
      dragRef.current.node.fy = wy
      if (simRef.current) simRef.current.alphaTarget(0.3).restart()
      return
    }

    const hitNode = findNodeAt(wx, wy)
    hoveredRef.current = hitNode
    canvas.style.cursor = hitNode ? 'pointer' : 'grab'
    draw()
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragRef.current.active && dragRef.current.node) {
      const node = dragRef.current.node
      setTimeout(() => {
        node.fx = null
        node.fy = null
        if (simRef.current) simRef.current.alphaTarget(0)
      }, 100)
    }
    dragRef.current = { node: null, active: false }
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const [wx, wy] = screenToWorld(mx, my)

    const hitNode = findNodeAt(wx, wy)
    if (hitNode) {
      const raw = rawNodes.find((n) => n.id === hitNode.id)
      if (raw) setSelectedNode(raw)
    } else {
      setSelectedNode(null)
    }
  }, [rawNodes])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const [wx, wy] = screenToWorld(mx, my)

    const hitNode = findNodeAt(wx, wy)
    if (hitNode && hitNode.x !== undefined && hitNode.y !== undefined) {
      const centerX = hitNode.x
      const centerY = hitNode.y
      const t = transformRef.current
      const dpr = window.devicePixelRatio || 1
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      t.k = Math.min(2.5, t.k * 1.5)
      t.x = -centerX * t.k + w / 2
      t.y = -centerY * t.k + h / 2
      draw()
    }
  }, [])

  function findNodeAt(wx: number, wy: number): SimNode | null {
    const nodes = nodesRef.current
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      if (n.x === undefined || n.y === undefined) continue
      const dx = wx - n.x
      const dy = wy - n.y
      if (dx * dx + dy * dy <= n.radius * n.radius) return n
    }
    return null
  }

  const handleEntityPanelClick = useCallback((entityName: string) => {
    const raw = rawNodes.find(
      (n) => n.label.toLowerCase() === entityName.toLowerCase()
    )
    if (raw) setSelectedNode(raw)
  }, [rawNodes])

  function toggleTypeFilter(type: string) {
    setTypeFilter((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const filteredNodes = rawNodes.filter(
    (n) => typeFilter.size === 0 || typeFilter.has(n.type)
  )

  const searchedNodes = searchQuery
    ? filteredNodes.filter((n) =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredNodes

  const searchedIds = new Set(searchedNodes.map((n) => n.id))

  return (
    <div className="flex h-full">
      <div className="relative flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-accent')}
          >
            <Filter className="mr-1.5 h-4 w-4" />
            Filters
          </Button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              const t = transformRef.current
              t.k = Math.min(5, t.k * 1.3)
              draw()
            }}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              const t = transformRef.current
              t.k = Math.max(0.1, t.k / 1.3)
              draw()
            }}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              transformRef.current = { x: 0, y: 0, k: 1 }
              draw()
            }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="ml-auto hidden text-xs text-muted-foreground sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Network className="h-3.5 w-3.5" />
              {nodeCount} nodes
            </span>
            <span>{edgeCount} edges</span>
          </div>
        </div>

        {/* Filters bar */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/30 px-4 py-2">
            <span className="mr-1 text-xs text-muted-foreground">Type:</span>
            {entityTypes.map((type) => (
              <Badge
                key={type}
                variant={typeFilter.has(type) ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => toggleTypeFilter(type)}
              >
                {type}
              </Badge>
            ))}
            {typeFilter.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setTypeFilter(new Set())}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden"
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Building graph...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                <p className="text-sm font-medium text-destructive">Failed to load graph</p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && nodeCount === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="text-center">
                <Network className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-medium">No knowledge graph data</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ingest transcripts with meetings to build the knowledge graph.
                </p>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className={cn('h-full w-full', loading && 'hidden')}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
          />
        </div>

        {/* Search results overlay */}
        {searchQuery && searchedNodes.length > 0 && (
          <div className="absolute left-4 top-16 z-20 max-h-60 w-64 overflow-y-auto rounded-lg border bg-background shadow-lg">
            <div className="p-1">
              {searchedNodes.slice(0, 20).map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    const simNode = nodesRef.current.find((n) => n.id === node.id)
                    if (simNode && simNode.x !== undefined && simNode.y !== undefined) {
                      const canvas = canvasRef.current
                      if (canvas) {
                        const dpr = window.devicePixelRatio || 1
                        const w = canvas.width / dpr
                        const h = canvas.height / dpr
                        const t = transformRef.current
                        t.k = 1.5
                        t.x = -simNode.x * t.k + w / 2
                        t.y = -simNode.y * t.k + h / 2
                        draw()
                      }
                      setSelectedNode(node)
                    }
                    setSearchQuery('')
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: NODE_COLORS[node.type] || NODE_COLORS.ENTITY }}
                  />
                  <span className="truncate">{node.label}</span>
                  <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                    {node.type}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entity detail panel */}
      <EntityPanel
        node={selectedNode}
        edges={rawEdges}
        onClose={() => setSelectedNode(null)}
        onEntityClick={handleEntityPanelClick}
      />
    </div>
  )
}
