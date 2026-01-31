import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizeHeights = { sm: 24, md: 40, lg: 64 }

export default function Logo({ size = 'md', showText, className = '' }: LogoProps) {
  const h = sizeHeights[size]
  return (
    <Image
      src="/TempestIQ logo transparent.png"
      alt="TempestIQ"
      width={Math.round(h * 4)}
      height={h}
      className={`object-contain ${className}`}
      style={{ height: h, width: 'auto' }}
    />
  )
}
