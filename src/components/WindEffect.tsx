'use client'

import { useMemo } from 'react'

const DEBRIS_COUNT = 24

function makeDebris() {
  return Array.from({ length: DEBRIS_COUNT }, (_, i) => ({
    id: i,
    radius: 12 + (i % 6) * 8 + (i % 3) * 4,
    duration: 6 + (i % 5) * 3 + (i % 2) * 2,
    delay: (i * 0.4 + (i % 7) * 0.6) % 5,
    reverse: i % 3 === 0,
    size: 2 + (i % 3),
    opacity: 0.12 + (i % 4) * 0.04,
  }))
}

export function WindEffect() {
  const debris = useMemo(() => makeDebris(), [])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
      style={{ zIndex: 1 }}
    >
      {/* Vortex center - rotating funnel gradient */}
      <div
        className="absolute left-[22%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vmin,400px)] h-[min(80vmin,400px)] rounded-full opacity-[0.14]"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg 60deg, rgba(255,255,255,0.35) 60deg 120deg, transparent 120deg 180deg, rgba(255,255,255,0.25) 180deg 240deg, transparent 240deg 300deg, rgba(255,255,255,0.3) 300deg 360deg)',
          animation: 'tornado-vortex-spin 8s linear infinite',
        }}
      />

      {/* Orbiting debris */}
      <div
        className="absolute left-[22%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0"
        style={{ zIndex: 2 }}
      >
        {debris.map((d) => (
          <div
            key={d.id}
            className="absolute left-0 top-0 rounded-full bg-white/90"
            style={{
              width: `${d.size}px`,
              height: `${d.size}px`,
              opacity: d.opacity,
              '--t-r': `-${d.radius}vmin`,
              animation: d.reverse
                ? `tornado-orbit-reverse ${d.duration}s linear infinite`
                : `tornado-orbit ${d.duration}s linear infinite`,
              animationDelay: `${-d.delay}s`,
              transformOrigin: 'center center',
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}
