'use client'

import { useState, useEffect, useRef } from 'react'

const DISPLAY_MS = 5000
const ENTER_MS = 500
const EXIT_MS = 500
const GAP_MS = 400

type AlertItem = {
  id: string
  title: string
  message: string
  icon: string
  accent: string
  border: string
}

const ALERTS: AlertItem[] = [
  {
    id: 'hail',
    title: 'Hail alert',
    message: 'Largest hail of the year in your registered area. 2"+ expected in the next 45 min—secure assets now.',
    icon: 'hail',
    accent: 'from-sky-500 to-blue-600',
    border: 'border-sky-300/50',
  },
  {
    id: 'lightning',
    title: 'Extreme lightning',
    message: 'Extreme lightning activity in your area. 80+ strikes/min—seek shelter and pause outdoor work.',
    icon: 'lightning',
    accent: 'from-amber-500 to-orange-600',
    border: 'border-amber-300/50',
  },
  {
    id: 'wind',
    title: 'High wind warning',
    message: 'Wind gusts 55–70 mph in your area over the next 2 hours. Secure loose materials and delay elevated work.',
    icon: 'wind',
    accent: 'from-slate-500 to-slate-700',
    border: 'border-slate-300/50',
  },
  {
    id: 'tornado',
    title: 'Tornado watch',
    message: 'Tornado watch in effect until 9 PM. Conditions favorable for severe storms—review shelter plans.',
    icon: 'tornado',
    accent: 'from-red-500 to-rose-600',
    border: 'border-red-300/50',
  },
  {
    id: 'severe',
    title: 'Severe thunderstorm',
    message: 'Severe storm cell moving into your area. Quarter-size hail and 60 mph winds possible—take cover.',
    icon: 'storm',
    accent: 'from-indigo-600 to-indigo-500',
    border: 'border-indigo-400/50',
  },
]

function HailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="5" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={1.5} d="M12 7v10M7 12h10" />
    </svg>
  )
}

function LightningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function WindIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 9h12M4 15h8" />
    </svg>
  )
}

function TornadoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16M8 8v12M12 6v14M16 4v16M20 2v18" />
    </svg>
  )
}

function StormIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function AlertIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'hail':
      return <HailIcon className={className} />
    case 'lightning':
      return <LightningIcon className={className} />
    case 'wind':
      return <WindIcon className={className} />
    case 'tornado':
      return <TornadoIcon className={className} />
    case 'storm':
      return <StormIcon className={className} />
    default:
      return <LightningIcon className={className} />
  }
}

type Side = 'left' | 'right'

function AlertCard({
  alert: a,
  phase,
  side,
}: {
  alert: AlertItem
  phase: 'entering' | 'visible' | 'exiting'
  side: Side
}) {
  const show = phase === 'entering' || phase === 'visible'
  const exiting = phase === 'exiting'
  const slideOff =
    side === 'right' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8'

  return (
    <div
      className={`
        rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl border ${a.border} overflow-hidden
        transform transition-all duration-500 ease-out max-w-[280px]
        ${show && !exiting ? 'opacity-100 translate-x-0' : slideOff}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="p-3 flex gap-3">
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${a.accent} flex items-center justify-center shadow-md`}
          aria-hidden
        >
          <AlertIcon icon={a.icon} className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-900 text-sm">TempestIQ</span>
            <span className="text-xs text-gray-500 flex-shrink-0">now</span>
          </div>
          <p className="font-medium text-gray-900 text-sm mt-0.5">{a.title}</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">{a.message}</p>
        </div>
      </div>
    </div>
  )
}

type Phase = 'entering' | 'visible' | 'exiting' | 'gap'

export function HeroAlerts() {
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('gap')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const clear = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const schedule = (fn: () => void, ms: number) => {
      clear()
      timeoutRef.current = setTimeout(fn, ms)
    }

    if (phase === 'gap') {
      schedule(() => setPhase('entering'), GAP_MS)
      return clear
    }

    if (phase === 'entering') {
      schedule(() => setPhase('visible'), ENTER_MS)
      return clear
    }

    if (phase === 'visible') {
      schedule(() => setPhase('exiting'), DISPLAY_MS)
      return clear
    }

    if (phase === 'exiting') {
      schedule(() => {
        setCurrentIndex((i) => (i + 1) % ALERTS.length)
        setPhase('gap')
        schedule(() => setPhase('entering'), GAP_MS)
      }, EXIT_MS)
      return clear
    }
  }, [mounted, phase, currentIndex])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!mounted) return null

  const alert = ALERTS[currentIndex]
  const showPhase = phase === 'gap' ? 'exiting' : phase
  // Alternate left/right by index: 0=right, 1=left, 2=right, 3=left, 4=right
  const side: Side = currentIndex % 2 === 0 ? 'right' : 'left'

  const positionClasses =
    side === 'right'
      ? 'left-4 right-4 md:left-auto md:right-6 md:max-w-[280px]'
      : 'left-4 right-4 md:right-auto md:left-6 md:max-w-[280px]'

  return (
    <div
      className={`absolute top-28 md:top-36 z-20 pointer-events-none min-h-0 ${positionClasses}`}
      aria-label="Platform alerts (demo)"
    >
      <AlertCard
        alert={alert}
        phase={showPhase === 'entering' || showPhase === 'visible' ? showPhase : 'exiting'}
        side={side}
      />
    </div>
  )
}
