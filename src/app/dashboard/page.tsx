'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaList } from '@/components/dashboard/AreaList'
import { DashboardPulse } from '@/components/dashboard/DashboardPulse'
import { DashboardMap } from '@/components/dashboard/DashboardMap'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

type StormEvent = {
  id: string
  type: 'hail' | 'wind'
  startTime: string
  endTime: string
  severityScore: number
  maxHailSizeIn: number | null
  maxWindSpeedMph: number | null
  impactedAreaCount: number
}

const CREW_CHECKLIST = [
  'Contact list pulled for affected zone',
  'Scripts ready (SMS / email / door hanger)',
  'Crews notified and dispatched',
  'Storm verification saved for proof',
]

export default function DashboardPage() {
  const customerId = useDashboardCustomer()
  const [storms, setStorms] = useState<StormEvent[]>([])
  const [loadingStorms, setLoadingStorms] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const loadSampleStorms = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/storm-events/seed', { method: 'POST' })
      if (res.ok) {
        const data = await fetch('/api/storm-events?limit=6').then((r) => r.json())
        setStorms(data.events ?? [])
      }
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    fetch('/api/storm-events?limit=6')
      .then((res) => res.ok ? res.json() : { events: [] })
      .then((data) => setStorms(data.events ?? []))
      .catch(() => setStorms([]))
      .finally(() => setLoadingStorms(false))
  }, [])

  return (
    <>
      {/* Hero with gradient and color */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 text-white shadow-lg">
        <div>
          <p className="text-sm text-indigo-200 font-medium">
            Free weather tells you it hailed. TempestIQ tells you where the money is.
          </p>
          <h1 className="text-3xl font-bold mt-1">Storm monetization command center</h1>
          <p className="text-sm text-indigo-100 mt-2 max-w-2xl">
            Detect storms, prove impact, and launch outreach fast with one system built for roofing and restoration teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/areas/new"
            className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium shadow"
          >
            Add area
          </Link>
          <Link
            href="/dashboard/scripts"
            className="px-4 py-2 bg-indigo-500/80 text-white rounded-lg hover:bg-indigo-400 border border-indigo-400/50 text-sm font-medium"
          >
            Open outreach scripts
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <DashboardPulse customerId={customerId} />
      </div>

      {/* Coverage map (Leaflet) */}
      <div className="mb-8">
        <DashboardMap customerId={customerId} />
      </div>

      {/* Crew deployment checklist - colored card */}
      <div className="mb-8 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-2">
          <span className="text-xl">✓</span> Crew deployment checklist
        </h2>
        <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mb-4">When a storm hits your zone, run through this so you move first.</p>
        <ul className="space-y-2">
          {CREW_CHECKLIST.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-amber-900 dark:text-amber-100">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-400 dark:bg-amber-600 text-amber-900 dark:text-amber-100 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
        <Link href="/dashboard/scripts" className="inline-block mt-4 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100">
          Get outreach scripts →
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent storms - purple/indigo accent */}
        <div className="lg:col-span-2 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⛈️</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent storm events</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open a storm to see polygons and generate proof.</p>
              </div>
            </div>
            <Link href="/dashboard/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all
            </Link>
          </div>
          {loadingStorms ? (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading storms…</div>
          ) : storms.length === 0 ? (
            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">No storms yet.</p>
              <button
                type="button"
                onClick={loadSampleStorms}
                disabled={seeding}
                className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {seeding ? 'Loading…' : 'Load sample storms'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {storms.map((storm) => (
                <div key={storm.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />
                      {storm.type.toUpperCase()} storm • Severity {storm.severityScore}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(storm.startTime).toLocaleString()} – {new Date(storm.endTime).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Impacted areas: {storm.impactedAreaCount}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/events/${storm.id}`}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm"
                  >
                    Open Storm
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Proof workflow - emerald accent */}
        <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">📋</span> Proof workflow
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Generate verification reports and keep a clean proof trail for homeowners and adjusters.
          </p>
          <div className="mt-4 space-y-3">
            <Link
              href="/dashboard/reports"
              className="block px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-center shadow-sm"
            >
              Open reports library
            </Link>
            <Link
              href="/dashboard/reports/new"
              className="block px-4 py-2 rounded-lg border-2 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-center"
            >
              Generate a report
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AreaList customerId={customerId} />
      </div>
    </>
  )
}
