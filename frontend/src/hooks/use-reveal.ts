'use client'

import { useAnimationControls } from 'motion/react'

export function useReveal(triggerOnce = true) {
  const controls = useAnimationControls()

  const refCallback = (node: HTMLElement | null) => {
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible')
          if (triggerOnce) observer.unobserve(node)
        } else if (!triggerOnce) {
          controls.start('hidden')
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(node)
  }

  return { controls, ref: refCallback }
}
