'use client'

import dynamic from 'next/dynamic'

const HailEffect = dynamic(
  () => import('@/components/HailEffect').then((m) => ({ default: m.HailEffect })),
  { ssr: false }
)
const LightningEffect = dynamic(
  () => import('@/components/LightningEffect').then((m) => ({ default: m.LightningEffect })),
  { ssr: false }
)

export function MarketingHeroEffects() {
  return (
    <>
      <HailEffect />
      <LightningEffect />
    </>
  )
}
