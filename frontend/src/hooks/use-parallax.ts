'use client'

import { useScroll, useTransform, MotionValue } from 'motion/react'
import { useRef } from 'react'

export function useParallax(speed = 0.5): [React.RefObject<HTMLElement | null>, MotionValue<number>] {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100])
  return [ref, y]
}
