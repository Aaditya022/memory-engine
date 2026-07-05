'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import NextLink from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { PrimaryButton, GhostButton } from './buttons'

const navLinks = [
  { label: 'Product', id: 'product' },
  { label: 'Solutions', id: 'solutions' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Docs', id: 'docs' },
  { label: 'Security', id: 'security' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = navLinks.map(l => l.id)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id)
      })
    }, { threshold: 0.3 })
    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(7, 11, 20, 0.85)'
            : 'rgba(7, 11, 20, 0)',
          backdropFilter: scrolled ? 'blur(24px) saturate(1.2)' : 'blur(0px)',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.2)' : 'blur(0px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0)',
        }}
      >
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        )}
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-[200px] h-[200px] text-white/80" />
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={`#${link.id}`}
                className="relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group"
                style={{
                  color: activeSection === link.id ? 'white' : 'rgba(255,255,255,0.6)',
                  background: activeSection === link.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}
              >
                {link.label}
                <span className="absolute bottom-0 left-3 right-3 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  style={{ backgroundColor: '#4F8BFF', transformOrigin: 'left' }} />
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <NextLink href="/login"><GhostButton>Sign in</GhostButton></NextLink>
            <NextLink href="/login"><PrimaryButton label="Start Free" size="sm" /></NextLink>
          </div>
          <button
            className="md:hidden w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4 text-white/60" /> : <Menu className="w-4 h-4 text-white/60" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#070B14]/95 backdrop-blur-xl pt-24 md:hidden"
          >
            <div className="flex flex-col items-center gap-6 px-6">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={`#${link.id}`}
                  className="text-xl font-medium text-white/70 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr className="w-full max-w-xs border-white/10 my-4" />
              <NextLink href="/login" onClick={() => setMobileOpen(false)}>
                <PrimaryButton label="Start Free" />
              </NextLink>
              <NextLink href="/login" onClick={() => setMobileOpen(false)}>
                <GhostButton>Sign in</GhostButton>
              </NextLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
