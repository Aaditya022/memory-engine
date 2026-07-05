'use client'

import { motion } from 'motion/react'
import { Shield, Lock, Users, ClipboardList, Code, Server } from 'lucide-react'
import { SectionEyebrow } from './section-eyebrow'

const brand = '#4F8BFF'

const securityCards = [
  { icon: Shield, title: 'SOC2 Type II', desc: 'Certified and audited annually' },
  { icon: Lock, title: 'End-to-End Encryption', desc: 'AES-256 at rest and in transit' },
  { icon: Users, title: 'Role-Based Access', desc: 'Granular permissions and SSO' },
  { icon: ClipboardList, title: 'Audit Trail', desc: 'Every action immutably logged' },
  { icon: Code, title: 'API Access', desc: 'REST & GraphQL with rate limiting' },
  { icon: Server, title: 'Self-Hosted', desc: 'Deploy on your infrastructure' },
]

const techStack = ['Kafka', 'Postgres', 'Redis', 'Vector Search', 'Spring Boot', 'Docker']

export function EnterpriseSecurity() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-44 border-t border-white/[0.06]" id="security">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionEyebrow label="Security" tag="Enterprise" />
          <h2 className="mt-6 section-title">
            Enterprise-grade security <br />&amp; <span className="gradient-text-cyan">compliance</span>.
          </h2>
          <p className="mt-6 body-text text-white/50 max-w-md leading-relaxed">
            Built for organizations that can&apos;t compromise. Every byte encrypted, every action logged, every access controlled. Your organizational memory stays yours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {techStack.map(tech => (
              <div key={tech} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
                <span className="text-sm font-mono text-white/30">{tech}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          {securityCards.map(card => (
            <div key={card.title} className="glass-card-premium rounded-xl p-5">
              <card.icon className="w-5 h-5" style={{ color: brand }} />
              <h3 className="text-base font-semibold text-white/80 mt-2">{card.title}</h3>
              <p className="text-sm text-white/40 mt-1">{card.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
