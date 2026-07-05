'use client'

import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  Keyboard,
  Command as CommandIcon,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Sparkles,
  MessageSquare,
  Bot,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StatusWidget } from '@/components/shared/status-widget'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [commandOpen, setCommandOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const initials = user?.userId
    ? user.userId.slice(0, 2).toUpperCase()
    : 'U'

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/70 backdrop-blur-xl px-4 lg:px-6">
        <button
          onClick={() => setCommandOpen(true)}
          className="relative flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-1.5 text-sm text-muted-foreground/50 transition-all hover:bg-muted/50 hover:text-muted-foreground/70 hover:border-border/80 group"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Search meetings, memories...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="ml-auto hidden items-center gap-1 rounded-lg border border-border/50 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground/40 md:inline-flex shadow-sm">
            <CommandIcon className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <div className="flex flex-1 items-center justify-end gap-0.5">
          <DropdownMenu open={showStatus} onOpenChange={setShowStatus}>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted/50" />
              }
            >
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft absolute top-2 right-2 ring-2 ring-background" />
              <Sparkles className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-0 rounded-xl overflow-hidden border-border/50 shadow-xl">
              <StatusWidget />
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted/50">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 ml-1" />
              }
            >
              <Avatar className="h-7 w-7 ring-2 ring-border/50">
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Account</span>
                  <span className="text-xs text-muted-foreground/60">
                    {user?.role?.toLowerCase() || 'user'} · Enterprise Plan
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-lg">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-lg">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCommandOpen(true)} className="rounded-lg">
                <Keyboard className="mr-2 h-4 w-4" />
                Keyboard shortcuts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput
          placeholder="Search meetings, memories, people..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Navigation">
            <CommandItem onSelect={() => { router.push('/dashboard'); setCommandOpen(false) }}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/meetings'); setCommandOpen(false) }}>
              <Calendar className="mr-2 h-4 w-4" />
              Meetings
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/search'); setCommandOpen(false) }}>
              <Search className="mr-2 h-4 w-4" />
              Memory Search
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/action-items'); setCommandOpen(false) }}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Action Items
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/timeline'); setCommandOpen(false) }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Timeline
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/search?tab=ai'); setCommandOpen(false) }}>
              <Bot className="mr-2 h-4 w-4" />
              AI Assistant
            </CommandItem>
          </CommandGroup>
          {searchValue && (
            <CommandGroup heading="Actions">
              <CommandItem>
                <Search className="mr-2 h-4 w-4" />
                Search for &ldquo;{searchValue}&rdquo;
              </CommandItem>
              <CommandItem>
                <Calendar className="mr-2 h-4 w-4" />
                Create meeting titled &ldquo;{searchValue}&rdquo;
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
