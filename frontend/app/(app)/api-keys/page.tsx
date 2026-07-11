'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function ApiKeysPage() {
  const [showKey, setShowKey] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">API key management is not yet available via the backend API</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coming Soon</CardTitle>
          <CardDescription>
            API key management endpoints are not implemented on the backend yet.
            Keys will allow programmatic access to the Memory Engine API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Key className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <h3 className="mt-3 text-sm font-medium">No API keys yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              API key management requires backend support (create, list, revoke endpoints).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
