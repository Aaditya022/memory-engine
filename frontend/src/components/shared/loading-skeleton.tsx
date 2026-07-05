'use client'

import { motion } from 'motion/react'

interface SkeletonBlockProps {
  className?: string
  delay?: number
}

function SkeletonBlock({ className = '', delay = 0 }: SkeletonBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`skeleton-pulse rounded-lg ${className}`}
    />
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-72" delay={0.1} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
            className="rounded-xl border border-border/50 p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-9 w-9 rounded-xl" />
            </div>
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="h-3 w-24" />
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-2 rounded-xl border border-border/50 p-6 space-y-4"
        >
          <SkeletonBlock className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-12 w-full" delay={0.45 + i * 0.05} />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-xl border border-border/50 p-6 space-y-4"
        >
          <SkeletonBlock className="h-5 w-28" />
          <SkeletonBlock className="h-52 w-full" />
        </motion.div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
        >
          <SkeletonBlock className="h-14 w-full" />
        </motion.div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <div className="rounded-xl border border-border/50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
