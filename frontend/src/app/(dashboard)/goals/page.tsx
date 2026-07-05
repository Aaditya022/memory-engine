'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Plus, TrendingUp, CheckCircle2, BarChart3 } from 'lucide-react'
export default function GoalsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageHeader
        title="Goals & OKRs"
        description="Track organizational goals and key results"
        actions={
          <Button className="rounded-xl gap-1.5">
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        }
      />
      <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
        <CardContent className="flex flex-col items-center py-24 text-center">
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 ring-1 ring-emerald-500/10">
            <Target className="h-12 w-12 text-emerald-500/40" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">Goals & OKRs</h3>
          <p className="mt-2 text-sm text-muted-foreground/60 max-w-md leading-relaxed">
            Goals and key results will be automatically extracted from your meetings and tracked here.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: TrendingUp, label: 'Track Progress', desc: 'Real-time updates' },
              { icon: CheckCircle2, label: 'Auto-detect', desc: 'From meetings' },
              { icon: BarChart3, label: 'Analytics', desc: 'Visual insights' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 mb-2">
                    <Icon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
