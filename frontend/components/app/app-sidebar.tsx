'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Search,
  Brain,
  ListChecks,
  History,
  Shield,
  Network,
  MessageSquare,
  Puzzle,
  Settings,
  Menu,
  X,
  BarChart3,
  Building2,
  Key,
  Library,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Memory',
    items: [
      { href: '/meetings', label: 'Meetings', icon: Calendar },
      { href: '/memories', label: 'Memories', icon: Library },
      { href: '/memory-chat', label: 'Memory Chat', icon: MessageSquare },
      { href: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
      { href: '/search', label: 'Hybrid Search', icon: Search },
      { href: '/memory/decisions', label: 'Decisions', icon: Brain },
      { href: '/memory/action-items', label: 'Action Items', icon: ListChecks },
      { href: '/memory/timeline', label: 'Timeline', icon: History },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/organizations', label: 'Organizations', icon: Building2 },
      { href: '/api-keys', label: 'API Keys', icon: Key },
      { href: '/settings/integrations', label: 'Integrations', icon: Puzzle },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/settings/preferences', label: 'Preferences', icon: Settings },
      { href: '/admin', label: 'Admin', icon: Shield },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-3 z-50 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform duration-200 md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="Memory Engine" className="h-16 w-auto" />
          </Link>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t p-4 text-xs text-muted-foreground">
          Memory Engine v0.1.0
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
