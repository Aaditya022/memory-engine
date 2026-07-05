'use client'

import { motion } from 'motion/react'
import NextLink from 'next/link'
import { Brain, Play } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from './buttons'

const brand = '#4F8BFF'

export function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="glass-card-premium relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(79,139,255,0.12), transparent 70%)', opacity: 0.5 }} />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border"
            style={{ backgroundColor: `${brand}15`, borderColor: `${brand}30` }}
          >
            <Brain className="w-8 h-8" style={{ color: brand }} />
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02]">
            Your organization<br />deserves a <span className="gradient-text-cyan">memory</span>.
          </h2>
          <p className="mt-6 body-text text-white/50 max-w-md mx-auto leading-relaxed">
            Join thousands of engineering leaders, product teams, and operators who treat organizational knowledge as infrastructure — not an afterthought.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NextLink href="/login"><PrimaryButton label="Book a Demo" size="lg" icon={<Play className="w-4 h-4" />} /></NextLink>
            <SecondaryButton>Start Free Trial</SecondaryButton>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
