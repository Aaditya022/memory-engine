'use client'

import { useScroll, useMotionValueEvent } from 'motion/react'
import { useState, useRef } from 'react'

export function useScrollProgress() {
  const { scrollYProgress } = useScroll()
  const [progress, setProgress] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setProgress(v))
  return progress
}

export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const lastY = useRef(0)

  useMotionValueEvent(useScroll().scrollY, 'change', (v) => {
    setDirection(v > lastY.current ? 'down' : 'up')
    lastY.current = v
  })

  return direction
}
