'use client'

import { motion, type Variants, type HTMLMotionProps } from 'motion/react'
import { forwardRef } from 'react'

const defaultEasing = [0.16, 1, 0.3, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: defaultEasing } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: defaultEasing } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: defaultEasing } },
}

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: defaultEasing } },
}

const slideRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: defaultEasing } },
}

function createMotionComponent(variants: Variants) {
  return forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(function MotionComponent(
    { children, ...props },
    ref
  ) {
    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        {...props}
      >
        {children}
      </motion.div>
    )
  })
}

export const MotionFadeUp = createMotionComponent(fadeUp)
export const MotionFadeIn = createMotionComponent(fadeIn)
export const MotionScaleIn = createMotionComponent(scaleIn)
export const MotionSlideLeft = createMotionComponent(slideLeft)
export const MotionSlideRight = createMotionComponent(slideRight)

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1, ease: defaultEasing },
  },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: defaultEasing },
  },
}

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.3, ease: defaultEasing },
  },
}

export function StaggerChildren({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  )
}
