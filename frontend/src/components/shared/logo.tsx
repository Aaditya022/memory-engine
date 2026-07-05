'use client'

import Image from 'next/image'

interface LogoProps {
  className?: string
}

export function Logo({ className = 'w-8 h-8' }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Memory Engine"
      className={className}
      width={200}
      height={200}
      priority
    />
  )
}
