'use client'

import { motion } from 'motion/react'
import { SectionEyebrow } from './section-eyebrow'
import LogoLoop from './logo-loop'

const brand = '#4F8BFF'

const techLogos = [
  { node: <span className="font-semibold tracking-tight text-white/90">Next.js</span>, title: 'Next.js' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#61DAFB' }}>React</span>, title: 'React' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#3178C6' }}>TypeScript</span>, title: 'TypeScript' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#06B6D4' }}>Tailwind</span>, title: 'Tailwind CSS' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#FFD43B' }}>Python</span>, title: 'Python' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#6DB33F' }}>Spring Boot</span>, title: 'Spring Boot' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#4169E1' }}>PostgreSQL</span>, title: 'PostgreSQL' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#DC382D' }}>Redis</span>, title: 'Redis' },
  { node: <span className="font-semibold tracking-tight" style={{ color: brand }}>Kafka</span>, title: 'Kafka' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#2496ED' }}>Docker</span>, title: 'Docker' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#326CE5' }}>Kubernetes</span>, title: 'Kubernetes' },
  { node: <span className="font-semibold tracking-tight" style={{ color: '#F97316' }}>Cognee</span>, title: 'Cognee' },
  { node: <span className="font-semibold tracking-tight text-white/90">GSAP</span>, title: 'GSAP' },
  { node: <span className="font-semibold tracking-tight text-white/90">Framer Motion</span>, title: 'Framer Motion' },
]

export function TechStackBar() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <SectionEyebrow label="Technology" tag="Built On" />
        <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-white/60">
          Powered by industry-leading <span className="text-white/90">open-source</span> technology
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
        style={{ minHeight: '80px' }}
      >
        <LogoLoop
          logos={techLogos}
          speed={50}
          direction="left"
          logoHeight={36}
          gap={56}
          hoverSpeed={10}
          fadeOut
          fadeOutColor="#070B14"
          scaleOnHover
          ariaLabel="Technology stack logos"
        />
      </motion.div>
    </section>
  )
}
