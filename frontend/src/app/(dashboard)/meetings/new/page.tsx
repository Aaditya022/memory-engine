'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { meetingsApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Calendar, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewMeetingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', participantNames: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await meetingsApi.create({
        title: form.title,
        participantNames: form.participantNames.split(',').map((s) => s.trim()).filter(Boolean),
      })
      toast.success('Meeting created')
      router.push(`/meetings/${res.data.data.id}`)
    } catch {
      toast.error('Failed to create meeting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href="/meetings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Meetings
      </Link>

      <PageHeader title="New Meeting" description="Create a new meeting record" />

      <div className="max-w-lg">
        <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium text-muted-foreground/80">Meeting Title</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input id="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required placeholder="Weekly standup" className="pl-9 rounded-xl bg-background/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="participants" className="text-xs font-medium text-muted-foreground/80">Participants (comma separated)</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input id="participants" value={form.participantNames} onChange={(e) => setForm((p) => ({ ...p, participantNames: e.target.value }))} placeholder="Alice, Bob, Charlie" className="pl-9 rounded-xl bg-background/50" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-xl h-10">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Meeting
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
