'use client'

import { useEffect, useState } from 'react'
import { integrationsApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/api/client'
import type { IntegrationResponse } from '@/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const INTEGRATION_META: Record<string, { icon: string; description: string; color: string }> = {
  SLACK: {
    icon: '💬',
    description: 'Sync meeting transcripts and notifications to your Slack workspace.',
    color: 'bg-[#4A154B]/10 text-[#4A154B] dark:text-[#E01E5A] border-[#4A154B]/20',
  },
  GITHUB: {
    icon: '🐙',
    description: 'Link action items to GitHub issues and pull requests.',
    color: 'bg-[#24292F]/10 text-[#24292F] dark:text-[#F0F6FC] border-[#24292F]/20',
  },
  NOTION: {
    icon: '📝',
    description: 'Export decisions and meeting notes to Notion databases.',
    color: 'bg-black/10 text-black dark:text-white border-black/20',
  },
  JIRA: {
    icon: '🔷',
    description: 'Create Jira tickets from action items and decisions.',
    color: 'bg-[#0052CC]/10 text-[#0052CC] dark:text-[#4C9AFF] border-[#0052CC]/20',
  },
  GOOGLE_CALENDAR: {
    icon: '📅',
    description: 'Auto-schedule meetings and sync calendar events.',
    color: 'bg-[#4285F4]/10 text-[#4285F4] dark:text-[#8AB4F8] border-[#4285F4]/20',
  },
  MICROSOFT_TEAMS: {
    icon: '💠',
    description: 'Connect with Microsoft Teams for meeting scheduling and notifications.',
    color: 'bg-[#6264A7]/10 text-[#6264A7] dark:text-[#8B8CC7] border-[#6264A7]/20',
  },
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await integrationsApi.list()
        setIntegrations(res.data)
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function toggleIntegration(integration: IntegrationResponse) {
    try {
      const res = await integrationsApi.update(integration.name, {
        enabled: !integration.enabled,
        configJson: integration.configJson || undefined,
      })
      setIntegrations((prev) =>
        prev.map((i) => (i.id === res.data.id ? res.data : i))
      )
      toast.success(
        `${integration.name} ${res.data.enabled ? 'connected' : 'disconnected'}`
      )
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function disconnectIntegration(integration: IntegrationResponse) {
    try {
      await integrationsApi.disconnect(integration.name)
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id
            ? { ...i, enabled: false, status: 'DISCONNECTED', configJson: null }
            : i
        )
      )
      toast.success(`${integration.name} disconnected`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your tools to extend Memory Engine capabilities
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const meta = INTEGRATION_META[integration.name]
            if (!meta) return null
            return (
              <Card key={integration.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meta.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{integration.name.replace('_', ' ').replace('MICROSOFT', 'MS')}</CardTitle>
                        <Badge
                          variant="outline"
                          className={
                            integration.status === 'CONNECTED'
                              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
                              : integration.status === 'ERROR'
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : ''
                          }
                        >
                          {integration.status === 'CONNECTED'
                            ? 'Connected'
                            : integration.status === 'ERROR'
                              ? 'Error'
                              : 'Not connected'}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={() => toggleIntegration(integration)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3">
                  <CardDescription className="text-sm">
                    {meta.description}
                  </CardDescription>
                  {integration.enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:bg-destructive/10"
                      onClick={() => disconnectIntegration(integration)}
                    >
                      Disconnect
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
