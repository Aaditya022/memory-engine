'use client'

import { UserMenu } from './user-menu'
import { NotificationCenter } from './notification-center'

export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
      <div className="ml-auto flex items-center gap-2">
        <NotificationCenter />
        <UserMenu />
      </div>
    </header>
  )
}
