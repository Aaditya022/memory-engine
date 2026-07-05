'use client'

import { motion } from 'motion/react'
import NextLink from 'next/link'
import { Check } from 'lucide-react'

const brand = '#4F8BFF'

const plans = [
  {
    name: 'Starter', price: 'Free', desc: 'For small teams exploring enterprise memory.',
    features: ['Up to 10 sources/month', 'Basic semantic search', '3 team members', 'Web access', 'Community support'],
    popular: false, cta: 'Get Started',
  },
  {
    name: 'Business', price: '$49', desc: 'For growing teams that need serious organizational memory.',
    features: ['Unlimited sources', 'Advanced semantic search', '25 team members', 'API access', 'Priority support', 'Cognee knowledge graph'],
    popular: true, cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise', price: 'Custom', desc: 'For organizations that need complete control over their memory infrastructure.',
    features: ['Unlimited everything', 'Custom Cognee models', 'SSO & SCIM', 'Dedicated infrastructure', 'SLA guarantee', 'White-glove onboarding'],
    popular: false, pro: true, cta: 'Contact Sales',
  },
]

export function PricingSection({ yearly, setYearly }: { yearly: boolean; setYearly: (v: boolean) => void }) {
  return (
    <section className="c3-pricing-section border-t border-white/[0.06]" id="pricing">
      <div className="c3-watermark-container">
        <div className="c3-watermark-main">
          <span className="c3-watermark-line-1">Enterprise</span>
          <span className="c3-watermark-line-2">Intelligence</span>
        </div>
      </div>
      <div className="c3-toggle-wrap">
        <span className="text-xs text-white/40 font-mono">Monthly</span>
        <button className={`c3-toggle ${yearly ? 'active' : ''}`} onClick={() => setYearly(!yearly)}>
          <div className="c3-toggle-knob" />
        </button>
        <span className="text-xs text-white/40 font-mono">Yearly</span>
      </div>
      <motion.div
        className="c3-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            className={`c3-card ${plan.pro ? 'c3-card-pro' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-4 right-4 rounded-full text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1" style={{ backgroundColor: brand }}>
                Most Popular
              </div>
            )}
            <div className="c3-tier-small">{plan.name}</div>
            <div className="c3-tier-large">
              {plan.price === 'Custom' ? 'Custom' : yearly ? (
                <>{plan.name === 'Business' ? '$499' : plan.price}<span className="text-base text-white/40 ml-1">/yr</span></>
              ) : (
                <>{plan.price}<span className="text-base text-white/40 ml-1">/mo</span></>
              )}
            </div>
            <div className="c3-desc">{plan.desc}</div>
            <ul className="c3-list">
              {plan.features.map(f => (
                <li key={f}>
                  <span className="c3-check"><Check className="w-3 h-3" /></span>
                  {f}
                </li>
              ))}
            </ul>
            <NextLink href="/login" className="c3-btn no-underline text-center">
              {plan.cta}
            </NextLink>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
