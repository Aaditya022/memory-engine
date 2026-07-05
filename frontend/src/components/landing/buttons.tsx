'use client'

import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'

export function MagneticButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3
    setPos({ x, y })
  }

  const onMouseLeave = () => setPos({ x: 0, y: 0 })

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="magnetic-btn">
      <motion.div
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function PrimaryButton({ label, size = 'md', className = '', icon }: { label: string; size?: 'sm' | 'md' | 'lg'; className?: string; icon?: React.ReactNode }) {
  const sizeClasses = size === 'sm' ? 'px-5 py-2 text-sm' : size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'
  return (
    <MagneticButton>
      <button className={`group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold ${sizeClasses} transition-all duration-300 active:scale-[0.97] overflow-hidden ${className}`}
        style={{
          background: 'linear-gradient(135deg, #4F8BFF, #6EA8FF, #8C6BFF)',
          boxShadow: '0 4px 24px rgba(79,139,255,0.3)',
        }}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: '0 0 30px rgba(79,139,255,0.4), 0 0 60px rgba(140,107,255,0.2)' }} />
        <span className="relative flex items-center gap-2 text-white">
          {label}
          {icon || <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
        </span>
      </button>
    </MagneticButton>
  )
}

export function SecondaryButton({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <MagneticButton>
      <button onClick={onClick} className={`group relative inline-flex items-center justify-center gap-2 rounded-full border border-white/20 text-white font-medium text-sm px-6 py-3 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/30 active:scale-[0.97] ${className}`}>
        {children}
      </button>
    </MagneticButton>
  )
}

export function GhostButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={`group inline-flex items-center gap-1.5 text-white/60 text-sm font-medium hover:text-white transition-all duration-300 ${className}`}>
      {children}
      <ChevronRight className="w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-1" />
    </button>
  )
}
