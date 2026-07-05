'use client'

import { useMotionValue, useSpring, useMotionValueEvent } from 'motion/react'
import { useEffect, useState } from 'react'

export function useCounter(target: number, delay = 0) {
  const count = useMotionValue(0)
  const [value, setValue] = useState(0)
  const spring = useSpring(count, { stiffness: 50, damping: 20 })

  useMotionValueEvent(spring, 'change', (v: number) => setValue(Math.round(v)))

  useEffect(() => {
    if (target === 0) return
    const timeout = setTimeout(() => {
      count.set(target)
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [target, delay, count])

  return value
}

export function AnimatedCounter({
  value: target,
  delay = 0,
  suffix = '',
  prefix = '',
  className = '',
}: {
  value: number
  delay?: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const count = useCounter(target, delay)
  return <span className={className}>{prefix}{count}{suffix}</span>
}
