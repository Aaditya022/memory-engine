'use client'

import { X, ExternalLink, Calendar, Hash, FileText, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import type { GraphNode, GraphEdge } from '@/types/api'

interface EntityPanelProps {
  node: GraphNode | null
  edges: GraphEdge[]
  onClose: () => void
  onEntityClick: (name: string) => void
}

const typeColors: Record<string, string> = {
  PERSON: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  TECHNOLOGY: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  ORGANIZATION: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  PRODUCT: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  PROJECT: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  DATE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  ENTITY: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800',
}

const relationshipColors: Record<string, string> = {
  owns: 'text-blue-500',
  assigned: 'text-amber-500',
  works_on: 'text-green-500',
  replaced_by: 'text-red-500',
  participates_in: 'text-purple-500',
}

export function EntityPanel({ node, edges, onClose, onEntityClick }: EntityPanelProps) {
  if (!node) return null

  const connectedEdges = edges.filter(
    (e) => e.source.toLowerCase() === node.label.toLowerCase() || e.target.toLowerCase() === node.label.toLowerCase()
  )

  return (
    <div className="flex h-full w-80 flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 rounded-full bg-primary/10 p-1.5">
            <User className="h-4 w-4 text-primary" />
          </div>
          <h3 className="truncate font-semibold">{node.label}</h3>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Type</p>
            <Badge variant="outline" className={typeColors[node.type] || typeColors.ENTITY}>
              {node.type}
            </Badge>
          </div>

          {node.mentionCount > 0 && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Mentions</p>
              <p className="text-sm font-medium">{node.mentionCount}</p>
            </div>
          )}

          {node.meetingTitle && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Source Meeting</p>
              <Link
                href={`/meetings/${node.meetingId}`}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                {node.meetingTitle}
              </Link>
            </div>
          )}

          <Separator />

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Relationships ({connectedEdges.length})
            </p>
            {connectedEdges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No relationships found</p>
            ) : (
              <div className="space-y-2">
                {connectedEdges.map((edge) => {
                  const isSource = edge.source.toLowerCase() === node.label.toLowerCase()
                  const related = isSource ? edge.target : edge.source
                  const direction = isSource ? '→' : '←'
                  return (
                    <button
                      key={edge.id}
                      onClick={() => onEntityClick(related)}
                      className="flex w-full items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <span className={relationshipColors[edge.relationship] || 'text-muted-foreground'}>
                        {direction}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">{related}</span>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {edge.relationship}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {node.meetingId && (
            <Link
              href={`/meetings/${node.meetingId}`}
              className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>View meeting details</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
