'use client'

import { useState, type FormEvent } from 'react'
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
import { Search as SearchIcon, FileText, User, Tag, Calendar, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const memoryTypes: { value: MemoryType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'DECISION', label: 'Decisions' },
  { value: 'ACTION_ITEM', label: 'Action Items' },
  { value: 'FACT', label: 'Facts' },
  { value: 'COMMITMENT', label: 'Commitments' },
  { value: 'DISCUSSION', label: 'Discussions' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [memoryType, setMemoryType] = useState<string>('ALL')
  const [ownerName, setOwnerName] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await searchApi.search({
        query: query.trim(),
        topK: 20,
        memoryType: memoryType === 'ALL' ? undefined : (memoryType as MemoryType),
        ownerName: ownerName.trim() || undefined,
      })
      setResults(res.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Search your organization&apos;s collective memory
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings, decisions, action items..."
            className="pl-9"
          />
        </div>
        <Input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Owner name (optional)"
          className="w-44"
        />
        <Select value={memoryType} onValueChange={setMemoryType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {memoryTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No results found for &ldquo;{query}&rdquo;
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <Card key={r.memoryId}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm font-medium leading-relaxed">{r.content}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {r.memoryType.replace('_', ' ')}
                      </Badge>
                      {r.ownerName && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {r.ownerName}
                        </span>
                      )}
                      {r.meetingTitle && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {r.meetingTitle}
                        </span>
                      )}
                      {r.createdAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Score: {(r.finalScore * 100).toFixed(0)}%
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(r.memoryId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
