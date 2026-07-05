'use client'

import { motion } from 'motion/react'
import { Star } from 'lucide-react'

const accent = '#00D4FF'

export function TrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 flex items-center gap-4 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02]"
    >
      <div className="flex -space-x-2">
        {[1,2,3,4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-[#161B26] to-[#0E121C] border border-white/10"
          />
        ))}
      </div>
      <span className="text-xs text-white/50">
        Trusted by <span className="text-white/70 font-medium">2,400+</span> forward-thinking enterprises
      </span>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.05, duration: 0.3, type: 'spring' }}
          >
            <Star className="w-3 h-3 fill-[#00D4FF]" style={{ color: accent }} />
          </motion.div>
        ))}
        <span className="text-xs text-white/40 ml-1">4.9/5</span>
      </div>
    </motion.div>
  )
}
