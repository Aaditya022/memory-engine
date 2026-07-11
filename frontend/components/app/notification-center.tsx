'use client'

import { useState } from 'react'
import { Bell, CheckCheck, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useNotifications, type NotificationEvent } from '@/hooks/use-notifications'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const typeIcons: Record<string, string> = {
  'transcript.processing': '⏳',
  'transcript.processed': '✅',
  'transcript.failed': '❌',
  'memories.extracted': '🧠',
  'action-item.updated': '📋',
}

export function NotificationCenter() {
  const { notifications, connected, unreadCount, markAllRead, clear } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={(o) => { setOpen(o); if (o) markAllRead() }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {!connected && (
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {connected && (
              <span className="flex items-center gap-1 text-[10px] text-green-500">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={markAllRead}>
                  <CheckCheck className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clear}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
        <Separator />
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground/60">
              Notifications appear when transcripts are processed
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="py-1">
              {notifications.map((n, i) => (
                <NotificationItem key={`${n.timestamp}-${i}`} event={n} />
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationItem({ event }: { event: NotificationEvent }) {
  const icon = typeIcons[event.type] || '🔔'

  const getLink = () => {
    if (event.resourceType === 'TRANSCRIPT' && event.resourceId) {
      return `/meetings`
    }
    if (event.resourceType === 'MEETING' && event.resourceId) {
      return `/meetings/${event.resourceId}`
    }
    if (event.resourceType === 'ACTION_ITEM' && event.resourceId) {
      return `/memory/action-items`
    }
    return null
  }

  const link = getLink()

  return (
    <div className={cn(
      'flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50',
      event.type === 'transcript.failed' && 'bg-destructive/5'
    )}>
      <span className="mt-0.5 text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{event.title}</p>
        <p className="text-xs text-muted-foreground">{event.description}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
          {link && (
            <Link href={link} className="flex items-center gap-0.5 text-primary hover:underline">
              View <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
