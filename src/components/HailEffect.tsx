'use client'

import { useMemo } from 'react'

const PARTICLE_COUNT = 22

function makeParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: (i * 4.5 + (i % 5) * 3) % 100,
    delay: (i * 0.12 + (i % 7) * 0.3) % 1.5,
    duration: 0.7 + (i % 4) * 0.2, // faster fall so it reads as hail, not snow
    size: 5 + (i % 6),
    opacity: 0.9 + (i % 2) * 0.06,
  }))
}

export function HailEffect() {
  const particles = useMemo(() => makeParticles(), [])

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[1] overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `hail-fall ${p.duration}s linear infinite`,
            animationDelay: `${-p.delay}s`,
            transformOrigin: '50% 50%',
          }}
        />
      ))}
    </div>
  )
}
