'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  LayoutDashboard,
  Calendar,
  Search,
  Brain,
  ListChecks,
  History,
  Network,
  MessageSquare,
  Puzzle,
  Shield,
  Moon,
  Sun,
  ArrowUpDown,
  FileDown,
  BarChart3,
  Library,
  Building2,
  Key,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, keywords: 'home overview' },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3, keywords: 'charts metrics statistics trends' },
  { id: 'meetings', label: 'Meetings', href: '/meetings', icon: Calendar, keywords: 'meeting calendar schedule' },
  { id: 'memories', label: 'Memories', href: '/memories', icon: Library, keywords: 'all memories extracted knowledge' },
  { id: 'memory-chat', label: 'Memory Chat', href: '/memory-chat', icon: MessageSquare, keywords: 'chat ask question ai' },
  { id: 'knowledge-graph', label: 'Knowledge Graph', href: '/knowledge-graph', icon: Network, keywords: 'graph visualization entities relationships' },
  { id: 'search', label: 'Hybrid Search', href: '/search', icon: Search, keywords: 'find memories search query' },
  { id: 'decisions', label: 'Decisions', href: '/memory/decisions', icon: Brain, keywords: 'decisions choices outcomes' },
  { id: 'action-items', label: 'Action Items', href: '/memory/action-items', icon: ListChecks, keywords: 'tasks todos actions' },
  { id: 'timeline', label: 'Timeline', href: '/memory/timeline', icon: History, keywords: 'history chronological events' },
  { id: 'organizations', label: 'Organizations', href: '/organizations', icon: Building2, keywords: 'org company team members' },
  { id: 'api-keys', label: 'API Keys', href: '/api-keys', icon: Key, keywords: 'api keys tokens access' },
  { id: 'integrations', label: 'Integrations', href: '/settings/integrations', icon: Puzzle, keywords: 'slack github notion jira calendar teams' },
  { id: 'admin', label: 'Admin', href: '/admin', icon: Shield, keywords: 'settings audit logs administration' },
]

const ACTIONS = [
  { id: 'toggle-theme', label: 'Toggle theme', icon: Moon, keywords: 'dark light mode theme', action: 'theme' },
  { id: 'export-csv', label: 'Export current view as CSV', icon: FileDown, keywords: 'export csv download', action: 'export-csv' },
  { id: 'export-json', label: 'Export current view as JSON', icon: FileDown, keywords: 'export json download', action: 'export-json' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [pages, setPages] = useState<string[]>([])
  const currentPage = pages[pages.length - 1]
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open])

  const navigate = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  const runAction = useCallback((action: string) => {
    setOpen(false)
    switch (action) {
      case 'theme':
        setTheme(theme === 'dark' ? 'light' : 'dark')
        break
      case 'export-csv':
      case 'export-json':
        // Handled by export button component
        break
    }
  }, [theme, setTheme])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl [&>button]:hidden">
        <Command className="rounded-lg border shadow-md" label="Command Menu">
          <div className="flex items-center border-b px-3">
            <ArrowUpDown className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Search pages, actions, and settings..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Pages">
              {PAGES.filter(
                (p) =>
                  !currentPage ||
                  p.keywords.includes(currentPage) ||
                  p.label.toLowerCase().includes(currentPage)
              ).map((page) => (
                <Command.Item
                  key={page.id}
                  value={`${page.label} ${page.keywords}`}
                  onSelect={() => navigate(page.href)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
                >
                  <page.icon className="h-4 w-4 text-muted-foreground" />
                  {page.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions">
              {ACTIONS.map((action) => (
                <Command.Item
                  key={action.id}
                  value={`${action.label} ${action.keywords}`}
                  onSelect={() => runAction(action.action)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
                >
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  {action.label}
                </Command.Item>
              ))}
            </Command.Group>

            <div className="border-t p-2">
              <p className="text-center text-[10px] text-muted-foreground">
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">↑↓</kbd> Navigate{' '}
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">↵</kbd> Open{' '}
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">Esc</kbd> Close
              </p>
            </div>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
