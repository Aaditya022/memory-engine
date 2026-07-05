'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { KnowledgeGraph } from '@/components/shared/knowledge-graph'
import { Network } from 'lucide-react'

export default function KnowledgeGraphPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageHeader
        icon={Network}
        title="Knowledge Graph"
        description="Visualize your organization&apos;s interconnected knowledge"
      />
      <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
        <CardContent className="p-6">
          <div className="h-[600px]">
            <KnowledgeGraph />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
