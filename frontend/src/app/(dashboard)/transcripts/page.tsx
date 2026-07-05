'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Upload, FileText } from 'lucide-react'

export default function TranscriptsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageHeader
        title="Transcripts"
        description="Upload and manage meeting transcripts"
        actions={
          <Button className="rounded-xl gap-1.5">
            <Upload className="h-4 w-4" />
            Upload Transcript
          </Button>
        }
      />
      <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
        <CardContent className="flex flex-col items-center py-24 text-center">
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 ring-1 ring-primary/10">
            <MessageSquare className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">Meeting Transcripts</h3>
          <p className="mt-2 text-sm text-muted-foreground/60 max-w-md leading-relaxed">
            Upload transcripts from your meetings to automatically extract memories, decisions, and action items using AI.
          </p>
          <div className="mt-8 flex gap-3">
            <Button className="rounded-xl gap-1.5">
              <Upload className="h-4 w-4" />
              Upload Transcript
            </Button>
            <Button variant="outline" className="rounded-xl gap-1.5">
              <FileText className="h-4 w-4" />
              View Sample
            </Button>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'AI Extraction', desc: 'Auto-extract memories' },
              { label: 'Smart Analysis', desc: 'Identify decisions' },
              { label: 'Action Tracking', desc: 'Track action items' },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-muted/30">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
