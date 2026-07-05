'use client'

import { useEffect, useState } from 'react'

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      if (!visible) setVisible(true)
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
    }
  }, [visible])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block"
      aria-hidden
    >
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
        style={{
          left: pos.x,
          top: pos.y,
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="h-[300px] w-[300px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(34,211,238,0.04) 30%, transparent 70%)',
          }}
        />
      </div>
    </div>
  )
}
