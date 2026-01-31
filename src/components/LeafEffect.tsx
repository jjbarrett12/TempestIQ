'use client'

import { useMemo } from 'react'

const LEAF_COUNT = 20

const LEAF_COLORS = [
  'rgba(251, 191, 36, 0.85)',   // amber-200
  'rgba(253, 186, 116, 0.85)',  // orange-200
  'rgba(254, 249, 195, 0.9)',   // yellow-100
  'rgba(217, 249, 157, 0.85)',  // lime-200
  'rgba(167, 243, 208, 0.85)',   // emerald-200
]

function makeLeaves() {
  return Array.from({ length: LEAF_COUNT }, (_, i) => ({
    id: i,
    top: (i * 5 + (i % 7) * 4) % 100,
    delay: (i * 0.5 + (i % 6) * 0.8) % 6,
    duration: 10 + (i % 6) * 3 + (i % 4) * 2,
    sizeW: 14 + (i % 6) * 3,
    sizeH: 10 + (i % 4) * 2,
    opacity: 0.3 + (i % 4) * 0.12,
    color: LEAF_COLORS[i % LEAF_COLORS.length],
    reverse: i % 4 === 0,
  }))
}

export function LeafEffect() {
  const leaves = useMemo(() => makeLeaves(), [])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
      style={{ zIndex: 1 }}
    >
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute rounded-full"
          style={{
            top: `${leaf.top}%`,
            left: leaf.reverse ? 'auto' : '-4%',
            right: leaf.reverse ? '-4%' : 'auto',
            width: `${leaf.sizeW}px`,
            height: `${leaf.sizeH}px`,
            backgroundColor: leaf.color,
            opacity: leaf.opacity,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            animation: leaf.reverse
              ? `leaf-blow-reverse ${leaf.duration}s ease-in-out infinite`
              : `leaf-blow ${leaf.duration}s ease-in-out infinite`,
            animationDelay: `${-leaf.delay}s`,
            transformOrigin: 'center center',
          }}
        />
      ))}
    </div>
  )
}
