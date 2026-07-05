'use client'

import { motion } from 'motion/react'

const brands = ['Linear', 'Vercel', 'Figma', 'Stripe', 'Notion', 'Datadog', 'Supabase', 'Raycast']

export function LogoCloud() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 border-y border-white/[0.06]">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-xs font-mono uppercase tracking-[0.2em] text-white/30 text-center mb-8"
      >
        Trusted by teams at
      </motion.p>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
        {brands.map((name, i) => (
          <motion.span
            key={name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="text-sm font-semibold tracking-tight text-white/30 hover:text-white/60 transition-colors text-center"
          >
            {name}
          </motion.span>
        ))}
      </div>
    </section>
  )
}
