'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bot, Copy, User, Brain,
  ArrowRight, Send, Lightbulb, Target,
  MessageSquare, TrendingUp,
  ThumbsUp, ThumbsDown,
} from 'lucide-react'
import { DEMO, demoDecisions, demoActionItems } from '@/lib/demo-data'
import { format } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestions = [
  { label: 'Recent decisions', icon: Lightbulb },
  { label: 'Pending tasks', icon: Target },
  { label: 'Knowledge summary', icon: MessageSquare },
  { label: 'Key trends', icon: TrendingUp },
  { label: 'Project Atlas', icon: Brain },
  { label: 'API migration', icon: ArrowRight },
]

function generateResponse(input: string): string {
  const q = input.toLowerCase()
  let response = ''

  if (q.includes('decision') || q.includes('decide')) {
    const top = demoDecisions.slice(0, 3)
    response = `Here are the recent decisions from your organization:\n\n${top.map((d, i) => `**${i + 1}. ${d.decisionText}**\n*Made by ${d.decisionMaker} · ${new Date(d.createdAt).toLocaleDateString()}*\n${d.finalOutcome}`).join('\n\n')}`
  } else if (q.includes('task') || q.includes('action') || q.includes('pending')) {
    const pending = demoActionItems.filter((i) => i.status !== 'DONE')
    response = `Here are your pending action items:\n\n${pending.map((i) => `**${i.task}**\n*Owner: ${i.ownerName} · Priority: ${i.priority} · Due: ${new Date(i.deadline).toLocaleDateString()}*`).join('\n\n')}`
  } else if (q.includes('summary') || q.includes('today') || q.includes('recent')) {
    response = `**Daily Summary — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}**\n\nYour organization has been productive today:\n\n- **${Math.floor(Math.random() * 5 + 2)}** knowledge sources processed\n- **${Math.floor(Math.random() * 20 + 10)}** new memories extracted by Cognee\n- **${Math.floor(Math.random() * 5 + 1)}** decisions captured\n- **${Math.floor(Math.random() * 8 + 3)}** action items assigned\n\n**Top Source:** "${demoDecisions[0].decisionText.split('—')[0].trim()}" with ${demoDecisions[0].decisionMaker} and team.`
  } else if (q.includes('atlas') || q.includes('project')) {
    response = `**Project Atlas — Status Overview**\n\nProject Atlas is a cross-team initiative to modernize the Cognee memory extraction pipeline.\n\n**Progress:** 67% complete\n**Team:** 8 members across 3 squads\n**Sources Processed:** 24 total · 12 remaining\n**Memories Generated:** 1,847\n**Decisions Made:** 34\n**Action Items:** 89 (42 completed, 28 in progress, 19 pending)\n\n**Key Milestones:**\n- ✅ Q4 2025: Architecture design finalized\n- ✅ Jan 2026: Core Cognee extraction engine v1 deployed\n- 🔄 Feb 2026: Knowledge graph integration (in progress)\n- 📅 Mar 2026: Performance optimization phase\n- 📅 Apr 2026: Production rollout`
  } else if (q.includes('api') || q.includes('migration')) {
    response = `**API Migration Status**\n\n**Initiative:** REST to GraphQL migration for core services\n**Lead:** Elena Rodriguez\n**Target Completion:** End of Q2 2026\n\n**Progress:**\n- ✅ Service A (Memory Search) — migrated\n- ✅ Service B (Source Ingestion) — migrated\n- 🔄 Service C (Cognee Processing) — in progress (73%)\n- 📅 Service D (Notification Service) — scheduled for May\n\n**Decisions Made:**\n- Adopted Apollo Federation for schema composition\n- Phased rollout with backward compatibility for 3 months\n- New services to be built in GraphQL from day one`
  } else {
    const stats = DEMO
    response = `Here's a quick overview of your Enterprise Memory workspace:\n\n**Workspace Statistics**\n- Knowledge Sources: **${stats.meetings.toLocaleString()}**\n- Memory Objects: **${stats.memories.toLocaleString()}**\n- Active Projects: **${stats.projects}**\n- Team Members: **${stats.people}**\n- Decision Chains: **${stats.decisions}**\n- Action Items: **${stats.actionItems.toLocaleString()}**\n\n**Recent Activity**\n${demoDecisions.slice(0, 2).map((d) => `- ${d.decisionText}`).join('\n')}\n\nHow can I help you further?`
  }

  return response
}

const formatContent = (content: string) => {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-semibold text-sm mt-3 mb-1.5">{line.replace(/\*\*/g, '')}</p>
    }
    if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*(.*)/)
      if (match) {
        return (
          <p key={i} className="text-xs leading-relaxed pl-3 border-l-2 border-primary/20 my-1">
            <span className="font-medium">{match[1]}</span>{match[2]}
          </p>
        )
      }
    }
    if (line.startsWith('- ✅') || line.startsWith('- 🔄') || line.startsWith('- 📅') || line.startsWith('- ')) {
      return <p key={i} className="text-xs leading-relaxed pl-3 my-0.5">{line}</p>
    }
    if (line.match(/^\d+\./)) {
      const parts = line.split(/(\*\*.+?\*\*)/)
      if (parts.length > 1) {
        return (
          <p key={i} className="text-xs leading-relaxed my-1">
            {parts[0]}<span className="font-medium">{parts[1].replace(/\*\*/g, '')}</span>{parts.slice(2).join('')}
          </p>
        )
      }
      return <p key={i} className="text-xs leading-relaxed my-1">{line}</p>
    }
    if (line.trim() === '') return <div key={i} className="h-1" />
    return <p key={i} className="text-xs leading-relaxed">{line}</p>
  })
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your Memory Engine AI assistant. I can help you search through meeting memories, find decisions, track action items, and more. Try asking me something!",
      timestamp: new Date(0),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamedContent])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setStreamedContent('')

    const fullResponse = generateResponse(input.trim())

    let charIndex = 0
    const interval = setInterval(() => {
      if (charIndex < fullResponse.length) {
        setStreamedContent(fullResponse.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(interval)
        setIsTyping(false)
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMsg])
        setStreamedContent('')
      }
    }, 10)
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 mb-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="mt-0.5 shrink-0">
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2 shadow-sm ring-1 ring-primary/10">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              )}
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary/15 text-foreground rounded-tr-md' : 'bg-muted/40 border border-border/30 rounded-tl-md'}`}>
                {formatContent(msg.content)}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
                  <span className="text-[10px] text-muted-foreground/40">
                    {format(msg.timestamp, 'HH:mm')}
                  </span>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 ml-auto">
                      <button onClick={() => handleCopy(msg.content)} className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors p-0.5">
                        <Copy className="h-3 w-3" />
                      </button>
                      <button className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors p-0.5">
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors p-0.5">
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="mt-0.5 shrink-0">
                  <div className="rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 p-2 shadow-sm">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mb-4"
            >
              <div className="mt-0.5 shrink-0">
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2 shadow-sm ring-1 ring-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <div className="max-w-[88%] rounded-2xl px-4 py-3 bg-muted/40 border border-border/30 rounded-tl-md">
                {streamedContent ? (
                  <div className="text-xs leading-relaxed">{formatContent(streamedContent)}</div>
                ) : (
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      <div className="border-t border-border/30 p-3 bg-background/50">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {suggestions.slice(0, 4).map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.label}
                onClick={() => { setInput(s.label); inputRef.current?.focus() }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-background/50 px-2.5 py-1 text-[10px] text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground hover:border-border/60 transition-all"
              >
                <Icon className="h-3 w-3" />
                {s.label}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Ask AI about your meetings..."
              className="h-10 text-xs rounded-xl bg-background/50 pr-10"
            />
          </div>
          <Button size="sm" className="h-10 rounded-xl shrink-0 px-3.5 shadow-sm" onClick={handleSend} disabled={isTyping || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
