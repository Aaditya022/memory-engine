'use client'

import { motion } from 'motion/react'
import {
  Brain, Search, Network, Bot, BarChart3, Shield,
  Sparkles, ArrowRight, Check,
} from 'lucide-react'
import NextLink from 'next/link'
import { SectionEyebrow } from './section-eyebrow'
import CardSwap, { Card } from './card-swap'
import { PrimaryButton } from './buttons'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  footer: string
  accent: string
  particles?: boolean
}

const accentColors: Record<string, { gradient: string; glow: string; bg: string; border: string }> = {
  blue: {
    gradient: 'from-[#4F8BFF]/20 via-[#6EA8FF]/10 to-transparent',
    glow: 'rgba(79,139,255,0.3)',
    bg: 'rgba(79,139,255,0.08)',
    border: 'rgba(79,139,255,0.25)',
  },
  purple: {
    gradient: 'from-[#8C6BFF]/20 via-[#6EA8FF]/10 to-transparent',
    glow: 'rgba(140,107,255,0.3)',
    bg: 'rgba(140,107,255,0.08)',
    border: 'rgba(140,107,255,0.25)',
  },
  cyan: {
    gradient: 'from-[#00D4FF]/20 via-[#6EA8FF]/10 to-transparent',
    glow: 'rgba(0,212,255,0.3)',
    bg: 'rgba(0,212,255,0.08)',
    border: 'rgba(0,212,255,0.25)',
  },
  violet: {
    gradient: 'from-[#6C5CE7]/20 via-[#4F8BFF]/10 to-transparent',
    glow: 'rgba(108,92,231,0.3)',
    bg: 'rgba(108,92,231,0.08)',
    border: 'rgba(108,92,231,0.25)',
  },
  green: {
    gradient: 'from-[#10B981]/20 via-[#34D399]/10 to-transparent',
    glow: 'rgba(16,185,129,0.3)',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
  },
  orange: {
    gradient: 'from-[#F59E0B]/20 via-[#FB923C]/10 to-transparent',
    glow: 'rgba(245,158,11,0.3)',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
}

function FeatureCard({ icon, title, description, footer, accent }: FeatureCardProps) {
  const colors = accentColors[accent] || accentColors.blue

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(14,18,28,0.95), rgba(7,11,20,0.85))',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(79,139,255,0.03)',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at 50% 0%, ${colors.glow}15, transparent 70%)`,
        }}
      />

      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          padding: '1px',
          background: `linear-gradient(135deg, ${colors.border}, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.02) 70%, ${colors.border})`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
        }}
      />

      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 2 + i * 2,
            height: 2 + i * 2,
            backgroundColor: colors.glow.replace('0.3', '0.15'),
            top: `${15 + i * 25}%`,
            right: `${10 + i * 12}%`,
            opacity: 0.3,
            filter: 'blur(1px)',
          }}
        />
      ))}

      <div className="relative p-5 md:p-6 h-full flex flex-col">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 0 20px ${colors.glow}10`,
          }}
        >
          <div className="text-xl">{icon}</div>
        </div>

        <h3 className="text-sm font-semibold text-white/90 mb-1 tracking-tight">{title}</h3>

        <p className="text-xs text-white/50 leading-relaxed">{description}</p>

        <div
          className="mt-auto pt-3 border-t flex items-center gap-2"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: colors.glow.replace('0.3', '') }} />
          <span className="text-xs font-medium" style={{ color: colors.glow.replace('0.3', '1') }}>
            {footer}
          </span>
        </div>
      </div>
    </div>
  )
}

const featureCards = [
  {
    id: '1',
    icon: '🧠',
    title: 'Persistent AI Memory',
    description: 'Never lose decisions, discussions or organizational knowledge again.',
    footer: 'Knowledge never disappears.',
    accent: 'blue' as const,
  },
  {
    id: '2',
    icon: '🔍',
    title: 'Hybrid Semantic Search',
    description: 'Search meetings using meaning instead of exact keywords.',
    footer: 'BM25 + Vector Search',
    accent: 'purple' as const,
  },
  {
    id: '3',
    icon: '🕸',
    title: 'Knowledge Graph',
    description: 'Automatically connect people, projects, technologies and decisions.',
    footer: 'Relationships that evolve.',
    accent: 'cyan' as const,
  },
  {
    id: '4',
    icon: '🤖',
    title: 'AI Meeting Intelligence',
    description: 'Automatically extract decisions, action items, risks, and facts from every meeting.',
    footer: 'Powered by Gemini + Cognee',
    accent: 'violet' as const,
  },
  {
    id: '5',
    icon: '📈',
    title: 'Memory Analytics',
    description: 'Track meetings, actions, trends and organizational knowledge growth.',
    footer: 'Real-time insights.',
    accent: 'green' as const,
  },
  {
    id: '6',
    icon: '⚡',
    title: 'Enterprise Ready',
    description: 'JWT Authentication, Redis, Kafka, Docker, Kubernetes, PostgreSQL, Spring Boot, Next.js.',
    footer: 'Built for production.',
    accent: 'orange' as const,
  },
]

export function WhyMemoryEngine() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-44 border-t border-white/[0.06] overflow-hidden">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionEyebrow label="Why Memory Engine" tag="Features" />
          <h2 className="mt-6 section-title">
            Why <span className="gradient-text-cyan">Memory Engine</span>?
          </h2>
          <p className="mt-4 body-text text-white/50 max-w-md leading-relaxed">
            Everything your organization needs to transform meetings into long-term AI memory.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { icon: Brain, text: 'AI-powered semantic understanding of every conversation' },
              { icon: Network, text: 'Connected knowledge graph across your entire organization' },
              { icon: Shield, text: 'Enterprise-grade security with SOC2 and end-to-end encryption' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: 'rgba(79,139,255,0.15)' }}>
                  <Check className="w-3 h-3" style={{ color: '#4F8BFF' }} />
                </div>
                <span className="text-sm text-white/60">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8"
          >
            <NextLink href="#">
              <PrimaryButton label="Explore Features" icon={<ArrowRight className="w-4 h-4" />} />
            </NextLink>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 md:mt-0"
        >
          <div className="relative" style={{ height: 480 }}>
            <CardSwap
              width={500}
              height={200}
              cardDistance={65}
              verticalDistance={70}
              delay={3500}
              pauseOnHover={true}
              skewAmount={6}
              easing="elastic"
            >
              {featureCards.map(card => (
                <Card key={card.id}>
                  <FeatureCard
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                    footer={card.footer}
                    accent={card.accent}
                  />
                </Card>
              ))}
            </CardSwap>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
