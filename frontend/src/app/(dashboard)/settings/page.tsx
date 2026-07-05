'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, User, Shield, Bell, Palette, Key, ChevronRight } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

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
                <Label className="text-xs font-medium text-muted-foreground/80">User ID</Label>
                <Input value={user?.userId || ''} readOnly className="bg-background/50 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground/80">Role</Label>
                <Input value={user?.role?.toLowerCase() || ''} readOnly className="bg-background/50 rounded-xl capitalize" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground/80">Organization ID</Label>
                <Input value={user?.organizationId || ''} readOnly className="bg-background/50 rounded-xl" />
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
                  <CardTitle className="text-base font-semibold">Security</CardTitle>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Manage your security preferences</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">API Keys</p>
                    <p className="text-xs text-muted-foreground/60">Manage your API access tokens</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground/60">Configure notification preferences</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">Appearance</p>
                    <p className="text-xs text-muted-foreground/60">Customize the interface</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
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
