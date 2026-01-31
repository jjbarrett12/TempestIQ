'use client'

export function LightningEffect() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[2] rounded-lg"
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/50 via-sky-200/30 to-transparent"
        style={{ animation: 'lightning-flash 12s ease-in-out infinite' }}
      />
    </div>
  )
}
