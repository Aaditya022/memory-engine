'use client'

import { useState } from 'react'
import { motion } from 'motion/react'

import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero'
import { LogoCloud } from '@/components/landing/logo-cloud'
import { ProblemSection } from '@/components/landing/problem-section'
import { ComparisonSection } from '@/components/landing/comparison-section'
import { CogneeArchitecture } from '@/components/landing/cognee-architecture'
import { QuerySection } from '@/components/landing/query-section'
import { KnowledgeGraphSection } from '@/components/landing/knowledge-graph-section'
import { EnterpriseSecurity } from '@/components/landing/enterprise-security'
import { PricingSection } from '@/components/landing/pricing-section'
import { WhyMemoryEngine } from '@/components/landing/why-memory-engine'
import { TechStackBar } from '@/components/landing/tech-stack-bar'
import { FinalCTA } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'
import { DashboardPreview } from '@/components/shared/dashboard-preview'

export default function WelcomePage() {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F9FAFB] selection:bg-brand/30 font-sans antialiased overflow-x-hidden">

      <svg className="fixed w-0 h-0" aria-hidden>
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
        <filter id="c3-noise-pricing">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
          <feComponentTransfer><feFuncA type="linear" slope="0.075" /></feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#070B14]" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }} />
      </div>

      <div className="fixed inset-0 z-[1] pointer-events-none grid-bg opacity-30" />

      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/[0.04] z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/[0.04] z-[5]" />

      <div className="relative z-10">
        <Navbar />

        <HeroSection />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex flex-col items-center gap-2 pb-8"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
          >
            <motion.div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Scroll to explore</span>
        </motion.div>

        <LogoCloud />

        <ProblemSection />
        <ComparisonSection />
        <CogneeArchitecture />
        <QuerySection />
        <KnowledgeGraphSection />
        <DashboardPreview />
        <EnterpriseSecurity />
        <WhyMemoryEngine />
        <TechStackBar />
        <PricingSection yearly={yearly} setYearly={setYearly} />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  )
}
