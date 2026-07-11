'use client'

import { useEffect, useState, useCallback } from 'react'
import { searchApi, memoriesApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { SearchResultItem, MemoryType } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Brain, ListChecks, MessageSquare, FileText, User, Calendar, Tag, Trash2, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICONS: Record<string, typeof Brain> = {
  DECISION: Brain,
  ACTION_ITEM: ListChecks,
  DISCUSSION: MessageSquare,
  FACT: FileText,
  COMMITMENT: ListChecks,
}

const memoryTypes: { value: MemoryType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'DECISION', label: 'Decisions' },
  { value: 'ACTION_ITEM', label: 'Action Items' },
  { value: 'FACT', label: 'Facts' },
  { value: 'COMMITMENT', label: 'Commitments' },
  { value: 'DISCUSSION', label: 'Discussions' },
]

export default function MemoriesPage() {
  const [query, setQuery] = useState('')
  const [memoryType, setMemoryType] = useState<string>('ALL')
  const [ownerName, setOwnerName] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (q: string, type: string, owner: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await searchApi.searchGet({
        query: q || '',
        topK: 100,
        memoryType: type === 'ALL' ? undefined : (type as MemoryType),
        ownerName: owner || undefined,
      })
      setResults(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load('', 'ALL', '') }, [load])

  function handleSearch() { load(query, memoryType, ownerName) }

  async function handleDelete(memoryId: string) {
    try {
      await memoriesApi.delete(memoryId)
      setResults((prev) => prev.filter((r) => r.memoryId !== memoryId))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Memories</h1>
        <p className="text-muted-foreground">All extracted memories across your organization</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search memories..."
            className="pl-9"
          />
        </div>
        <Input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Owner name"
          className="w-44"
        />
        <Select value={memoryType} onValueChange={setMemoryType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {memoryTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={loading}>Search</Button>
      </div>

      {error && <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No memories found. Ingest a transcript to extract memories.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((r) => {
            const Icon = TYPE_ICONS[r.memoryType] || Brain
            return (
              <Card key={r.memoryId}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-sm leading-relaxed">{r.content}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {r.memoryType.replace('_', ' ')}
                          </Badge>
                          {r.ownerName && (
                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{r.ownerName}</span>
                          )}
                          {r.meetingTitle && (
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{r.meetingTitle}</span>
                          )}
                          {r.createdAt && (
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                          )}
                          <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{(r.finalScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(r.memoryId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
