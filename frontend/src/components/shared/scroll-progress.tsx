'use client'

import { useScrollProgress } from '@/hooks/use-scroll-progress'
import { motion, useSpring } from 'motion/react'

export function ScrollProgress() {
  const progress = useScrollProgress()
  const scaleX = useSpring(progress, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] origin-left bg-gradient-to-r from-primary via-accent to-primary"
      style={{ scaleX }}
    />
  )
}
