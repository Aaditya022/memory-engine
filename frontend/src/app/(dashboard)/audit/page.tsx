'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { auditApi } from '@/lib/api'
import type { AuditLogResponse } from '@/types/api'
import { Shield, Clock, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    auditApi.list({ page: 0, size: 50 })
      .then((res) => { if (!cancelled) setLogs(res.data.data.content) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageHeader title="Audit Logs" description="Track all actions across your organization" />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
          <CardContent className="flex flex-col items-center py-20 text-center">
            <div className="mb-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 p-4 ring-1 ring-border/50">
              <Shield className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">No audit logs</h3>
            <p className="mt-1 text-sm text-muted-foreground/60">Actions performed in your organization will be logged here</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
          <div className="divide-y divide-border/30">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="mt-0.5 rounded-lg bg-primary/8 p-2 shrink-0">
                  <Activity className="h-3.5 w-3.5 text-primary/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{log.action}</span>
                    <span className="text-xs text-muted-foreground/50">on</span>
                    <Badge variant="outline" className="text-[10px] rounded-md">{log.resourceType}</Badge>
                  </div>
                  {log.details && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{log.details}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/40">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  )
}
