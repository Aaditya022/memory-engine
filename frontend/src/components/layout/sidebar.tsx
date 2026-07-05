'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/providers/theme-provider'
import { Logo } from '@/components/shared/logo'
import {
  LayoutDashboard,
  Calendar,
  Search,
  ClipboardList,
  GitBranch,
  Clock,
  Shield,
  Settings,
  MessageSquare,
  Network,
  Users,
  FolderOpen,
  Sun,
  Moon,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const mainNav: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Meetings', href: '/meetings', icon: Calendar },
  { title: 'Memory Search', href: '/search', icon: Search },
  { title: 'Knowledge Graph', href: '/knowledge-graph', icon: Network },
  { title: 'Timeline', href: '/timeline', icon: Clock },
]

const workspaceNav: NavItem[] = [
  { title: 'Transcripts', href: '/transcripts', icon: MessageSquare },
  { title: 'Projects', href: '/goals', icon: FolderOpen },
  { title: 'People', href: '/search', icon: Users },
  { title: 'Action Items', href: '/action-items', icon: ClipboardList },
  { title: 'Decisions', href: '/decisions', icon: GitBranch },
]

const adminNav: NavItem[] = [
  { title: 'Audit Logs', href: '/audit', icon: Shield },
  { title: 'Settings', href: '/settings', icon: Settings },
]

function NavItemComp({ item, collapsed, isActive }: { item: NavItem; collapsed: boolean; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link href={item.href}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'w-full justify-start gap-3 px-3 font-normal h-9 rounded-lg transition-all duration-200',
          collapsed && 'justify-center px-0 w-10 mx-auto',
          isActive
            ? 'bg-primary/10 text-primary font-medium shadow-sm'
            : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate text-sm">{item.title}</span>
            {item.badge && (
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Button>
    </Link>
  )
}

function NavSection({ items, collapsed, label }: { items: NavItem[]; collapsed: boolean; label: string }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col gap-0.5">
      {!collapsed && (
        <p className="px-3 pb-1.5 text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-[0.12em]">{label}</p>
      )}
      {items.map((item) => (
        <NavItemComp
          key={item.href}
          item={item}
          collapsed={collapsed}
          isActive={pathname === item.href}
        />
      ))}
    </div>
  )
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        collapsed ? 'w-[60px]' : 'w-56',
      )}
    >
<div className={cn('flex h-14 items-center border-b border-sidebar-border/50 px-3', collapsed && 'justify-center')}>
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-1.5 shadow-sm">
            <Logo className="h-[200px] w-[200px] text-primary" />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-5">
          <NavSection items={mainNav} collapsed={collapsed} label="Navigation" />
          <NavSection items={workspaceNav} collapsed={collapsed} label="Workspace" />
          <NavSection items={adminNav} collapsed={collapsed} label="Administration" />
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border/50 p-2 space-y-1.5">
        {!collapsed && (
          <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-primary/8 to-primary/3 px-3 py-2.5 mb-1 border border-primary/5">
            <div className="rounded-lg bg-emerald-500/15 p-1.5">
              <Sparkles className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-sidebar-foreground/80 truncate">Enterprise Plan</p>
              <p className="text-[8px] text-sidebar-foreground/35 uppercase tracking-wider">Active</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              'text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 h-8 rounded-lg',
              collapsed ? 'justify-center flex-1 w-10' : 'px-2 flex-1',
            )}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span className="ml-2 text-xs">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 h-8 w-8 rounded-lg shrink-0"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
