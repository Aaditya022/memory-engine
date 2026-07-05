'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { transcriptsApi } from '@/lib/api'
import { toast } from 'sonner'
import { Upload, FileText, Loader2, CheckCircle2, X, AlertCircle } from 'lucide-react'

const ALLOWED_TYPES = ['.txt', '.md', '.json', '.csv', '.srt', '.vtt']
const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

interface UploadedFile {
  file: File
  content: string
  meetingTitle: string
}

export default function TranscriptsPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const validateAndAdd = async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(ext)) {
      toast.error(`Unsupported file type: ${ext}. Allowed: ${ALLOWED_TYPES.join(', ')}`)
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File too large (max ${MAX_SIZE_MB}MB): ${file.name}`)
      return
    }
    try {
      const content = await readFile(file)
      const title = file.name.replace(/\.[^/.]+$/, '')
      setUploadedFiles((prev) => [...prev, { file, content, meetingTitle: title }])
    } catch {
      toast.error(`Failed to read file: ${file.name}`)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) validateAndAdd(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) validateAndAdd(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadAll = async () => {
    setUploading(true)
    let success = 0
    let failed = 0
    for (const uf of uploadedFiles) {
      try {
        await transcriptsApi.ingest({ meetingId: uf.meetingTitle, rawText: uf.content })
        success++
      } catch {
        failed++
      }
    }
    setUploading(false)
    if (success > 0) {
      toast.success(`${success} transcript${success > 1 ? 's' : ''} uploaded successfully`)
      if (failed === 0) setUploadedFiles([])
    }
    if (failed > 0) toast.error(`${failed} upload${failed > 1 ? 's' : ''} failed`)
  }

  const removeFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageHeader
        title="Transcripts"
        description="Upload and manage meeting transcripts"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
            <CardContent className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer ${
                  dragOver
                    ? 'border-primary/60 bg-primary/5'
                    : 'border-border/40 hover:border-border/60 hover:bg-muted/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(',')}
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 ring-1 ring-primary/10">
                  {dragOver ? (
                    <Upload className="h-10 w-10 text-primary/60" />
                  ) : (
                    <FileText className="h-10 w-10 text-primary/40" />
                  )}
                </div>
                <h3 className="text-base font-semibold mb-1">
                  {dragOver ? 'Drop files here' : 'Drop transcripts here'}
                </h3>
                <p className="text-sm text-muted-foreground/60 mb-4 max-w-sm">
                  or click to browse &mdash; supports {ALLOWED_TYPES.join(', ')} up to {MAX_SIZE_MB}MB each
                </p>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 pointer-events-none">
                  <Upload className="h-4 w-4" />
                  Select Files
                </Button>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setUploadedFiles([])} className="text-xs h-8">Clear all</Button>
                        <Button size="sm" onClick={uploadAll} disabled={uploading} className="rounded-xl gap-1.5 h-8">
                          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          {uploading ? 'Uploading...' : 'Upload All'}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {uploadedFiles.map((uf, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 p-3">
                          <FileText className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{uf.file.name}</p>
                            <p className="text-[10px] text-muted-foreground/50">{(uf.file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button onClick={() => removeFile(i)} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl bg-primary/10 p-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Ready to process</p>
                  <p className="text-[10px] text-muted-foreground/60">AI will extract memories</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground/70">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Extract decisions</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Identify action items</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Generate summaries</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Build knowledge graph</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl bg-amber-500/10 p-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Format Guide</p>
                  <p className="text-[10px] text-muted-foreground/60">Supported formats</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground/70">
                <p><code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">.txt</code> Plain text transcripts</p>
                <p><code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">.md</code> Markdown meeting notes</p>
                <p><code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">.srt</code> SubRip subtitle format</p>
                <p><code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">.vtt</code> WebVTT transcript format</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
