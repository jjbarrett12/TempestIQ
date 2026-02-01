'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AssetList } from '@/components/dashboard/AssetList'
import { DashboardPulse } from '@/components/dashboard/DashboardPulse'
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

  useEffect(() => {
    fetch('/api/storm-events?limit=6')
      .then((res) => res.ok ? res.json() : { events: [] })
      .then((data) => setStorms(data.events ?? []))
      .catch(() => setStorms([]))
      .finally(() => setLoadingStorms(false))
  }, [])
  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <p className="text-sm text-indigo-500 font-medium">
            Free weather tells you it hailed. TempestIQ tells you where the money is.
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Storm monetization command center</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Detect storms, prove impact, and launch outreach fast with one system built for roofing and restoration teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/assets/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Add location
          </Link>
          <Link
            href="/dashboard/scripts"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 text-sm font-medium"
          >
            Open outreach scripts
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <DashboardPulse customerId={customerId} />
      </div>

      {/* Crew deployment checklist */}
      <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Crew deployment checklist</h2>
        <p className="text-sm text-gray-600 mb-4">When a storm hits your zone, run through this so you move first.</p>
        <ul className="space-y-2">
          {CREW_CHECKLIST.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
        <Link href="/dashboard/scripts" className="inline-block mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          Get outreach scripts →
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent storm events</h2>
              <p className="text-sm text-gray-600">Open a storm to see polygons and generate proof.</p>
            </div>
            <Link href="/dashboard/events" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all
            </Link>
          </div>
          {loadingStorms ? (
            <div className="p-6 text-sm text-gray-500">Loading storms…</div>
          ) : storms.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No storms yet. Seed mock data to populate this list.</div>
          ) : (
            <div className="divide-y">
              {storms.map((storm) => (
                <div key={storm.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {storm.type.toUpperCase()} storm • Severity {storm.severityScore}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(storm.startTime).toLocaleString()} – {new Date(storm.endTime).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Impacted areas: {storm.impactedAreaCount}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/events/${storm.id}`}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                  >
                    Open Storm
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Proof workflow</h2>
          <p className="text-sm text-gray-600 mt-2">
            Generate verification reports and keep a clean proof trail for homeowners and adjusters.
          </p>
          <div className="mt-4 space-y-3">
            <Link
              href="/dashboard/reports"
              className="block px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 text-center"
            >
              Open reports library
            </Link>
            <Link
              href="/dashboard/events"
              className="block px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:border-gray-300 text-center"
            >
              Generate a report
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AssetList customerId={customerId} />
      </div>
    </>
  )
}
