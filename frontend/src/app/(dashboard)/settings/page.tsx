'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { LogOut, User, Shield, Bell, Palette, Key } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/providers/theme-provider'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    router.push('/login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Profile</CardTitle>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Your account information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground/80">User ID</label>
                <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground/80">{user?.userId || ''}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground/80">Role</label>
                <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground/80 capitalize">{user?.role?.toLowerCase() || ''}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground/80">Organization ID</label>
                <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground/80">{user?.organizationId || ''}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-2.5">
                  <Shield className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Preferences</CardTitle>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Manage your preferences</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center justify-between py-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground/60">Switch between light and dark mode</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-lg min-w-[100px]"
                >
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground/60">Push and email notifications</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">API Keys</p>
                    <p className="text-xs text-muted-foreground/60">Manage your API access tokens</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toast.info('API key management coming soon')}>
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-destructive/10 p-2.5">
                  <LogOut className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Session</CardTitle>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">End your current session</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout} className="w-full rounded-xl">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl bg-primary/10 p-2">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Enterprise</p>
                  <p className="text-[10px] text-muted-foreground/60">SOC 2 Compliant</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                Your data is encrypted at rest and in transit. All access is logged and auditable.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
