'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface Service {
  name: string
  status: 'operational' | 'degraded' | 'down'
  latency?: string
}

const services: Service[] = [
  { name: 'Backend API', status: 'operational', latency: '42ms' },
  { name: 'PostgreSQL', status: 'operational', latency: '8ms' },
  { name: 'Redis Cache', status: 'operational', latency: '2ms' },
  { name: 'Kafka', status: 'operational', latency: '15ms' },
  { name: 'Gemini AI', status: 'operational', latency: '340ms' },
  { name: 'Cognee', status: 'degraded', latency: '1200ms' },
  { name: 'Vector Search', status: 'operational', latency: '65ms' },
  { name: 'JWT Auth', status: 'operational', latency: '4ms' },
]

export function StatusWidget() {
  const [lastChecked, setLastChecked] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setLastChecked(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const operational = services.filter((s) => s.status === 'operational').length

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground/80">System Status</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div className="space-y-2">
        {services.map((service) => {
          const dotColor =
            service.status === 'operational'
              ? 'bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500/50'
              : service.status === 'degraded'
                ? 'bg-amber-500 shadow-[0_0_6px] shadow-amber-500/50'
                : 'bg-red-500 shadow-[0_0_6px] shadow-red-500/50'

          const Icon =
            service.status === 'operational'
              ? CheckCircle
              : service.status === 'degraded'
                ? AlertCircle
                : XCircle

          const iconColor =
            service.status === 'operational'
              ? 'text-emerald-500'
              : service.status === 'degraded'
                ? 'text-amber-500'
                : 'text-red-500'

          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dotColor} ${service.status === 'operational' ? 'animate-pulse-glow' : ''}`} />
                <span className="text-[11px] text-foreground/70 group-hover:text-foreground transition-colors">{service.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {service.latency && (
                  <span className="text-[10px] text-muted-foreground">{service.latency}</span>
                )}
                <Icon className={`h-3 w-3 ${iconColor}`} />
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{operational}/{services.length} services operational</span>
        <span className="text-[10px] font-medium text-emerald-500">99.2% uptime</span>
      </div>
    </div>
  )
}
