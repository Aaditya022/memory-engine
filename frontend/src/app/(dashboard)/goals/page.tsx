'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Target, Plus, TrendingUp, CheckCircle2, BarChart3, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Goal {
  id: string
  title: string
  description: string
  progress: number
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      progress: 0,
    }
    setGoals((prev) => [...prev, newGoal])
    setTitle('')
    setDescription('')
    setShowForm(false)
    setSaving(false)
    toast.success('Goal created')
  }

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
          <Button onClick={() => setShowForm(true)} className="rounded-xl gap-1.5">
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl mb-6">
              <CardContent className="p-5">
                <form onSubmit={createGoal} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground/80">Goal title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Improve memory extraction accuracy"
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground/80">Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the goal and key results..."
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="rounded-lg">Cancel</Button>
                    <Button type="submit" size="sm" disabled={saving || !title.trim()} className="rounded-lg gap-1.5">
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Create Goal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {goals.length === 0 && !showForm ? (
        <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
          <CardContent className="flex flex-col items-center py-24 text-center">
            <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 ring-1 ring-emerald-500/10">
              <Target className="h-12 w-12 text-emerald-500/40" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Goals & OKRs</h3>
            <p className="mt-2 text-sm text-muted-foreground/60 max-w-md leading-relaxed">
              Create goals to track your organization&apos;s progress. Goals will also be automatically extracted from your meetings.
            </p>
            <Button onClick={() => setShowForm(true)} className="mt-8 rounded-xl gap-1.5">
              <Plus className="h-4 w-4" />
              Create your first goal
            </Button>
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
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-2.5">
                      <Target className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground/70 mt-1">{goal.description}</p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted/30 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${goal.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground/60 w-8 text-right">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
