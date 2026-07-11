'use client'

import { KnowledgeGraph } from '@/components/app/knowledge-graph'

export default function KnowledgeGraphPage() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Knowledge Graph</h1>
        <p className="text-muted-foreground">
          Explore entities and relationships extracted from your meetings
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border bg-card">
        <KnowledgeGraph />
      </div>
    </div>
  )
}
