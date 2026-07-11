'use client'

import { MemoryChat } from '@/components/app/memory-chat'

export default function MemoryChatPage() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">AI Memory Chat</h1>
        <p className="text-muted-foreground">
          Ask questions about your organization&apos;s meetings, decisions, and knowledge
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border bg-card">
        <MemoryChat />
      </div>
    </div>
  )
}
