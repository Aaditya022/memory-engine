'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Send, Loader2, MessageSquare, Bot, User, ExternalLink, ChevronDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { chatApi } from '@/lib/api/chat'
import { getErrorMessage } from '@/lib/api/client'
import Link from 'next/link'
import type { ChatMessage, ChatResponse, Citation } from '@/types/api'

export function MemoryChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I can answer questions about your meetings, decisions, action items, and organizational knowledge. Try asking me something like "What was decided in the last meeting?" or "What are the open action items?"',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [citations, setCitations] = useState<Citation[]>([])
  const [followUps, setFollowUps] = useState<string[]>([])
  const [showSources, setShowSources] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, citations])

  const handleSubmit = useCallback(async (query?: string) => {
    const q = query || input
    if (!q.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: q.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setCitations([])
    setFollowUps([])

    try {
      const res = await chatApi.send({
        query: q.trim(),
        history: messages.filter((m) => m.role === 'user' || m.role === 'assistant'),
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }])
      setCitations(res.data.citations || [])
      setFollowUps(res.data.followUpQuestions || [])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I encountered an error: ${getErrorMessage(err)}` },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  return (
    <div className="flex h-full flex-1">
      <div className="flex flex-1 flex-col">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-3 rounded-lg p-4',
                  msg.role === 'assistant' ? 'bg-muted/50' : 'bg-primary/5'
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {msg.role === 'assistant' ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10">
                      <User className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {msg.role === 'assistant' ? 'Memory AI' : 'You'}
                  </p>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 rounded-lg bg-muted/50 p-4">
                <div className="mt-0.5 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            {/* Citations */}
            {citations.length > 0 && !loading && (
              <div className="rounded-lg border bg-card">
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex w-full items-center justify-between p-3 text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Sources ({citations.length})
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      showSources && 'rotate-180'
                    )}
                  />
                </button>
                {showSources && (
                  <div className="border-t p-3">
                    <div className="space-y-2">
                      {citations.map((c, i) => (
                        <div key={i} className="rounded-md border p-3 text-sm">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">
                              {c.memoryType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Score: {(c.score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="mb-1 text-xs">{c.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{c.ownerName}</span>
                            <span>·</span>
                            <Link
                              href={`/meetings/${c.meetingId}`}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              {c.meetingTitle}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Follow-up questions */}
            {followUps.length > 0 && !loading && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Suggested follow-ups</p>
                <div className="flex flex-wrap gap-2">
                  {followUps.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(q)}
                      className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-background p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Input
              placeholder="Ask about your organization's knowledge..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={() => handleSubmit()} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
