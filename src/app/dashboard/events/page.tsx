'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type StormEvent = {
  id: string
  type: 'hail' | 'wind'
  startTime: string
  endTime: string
  maxHailSizeIn: number | null
  maxWindSpeedMph: number | null
  impactedAreaCount: number
  severityScore: number
}

const TYPE_FILTERS = [
  { label: 'All storms', value: 'all' },
  { label: 'Hail', value: 'hail' },
  { label: 'Wind', value: 'wind' },
]

function formatStormType(type: StormEvent['type']) {
  return type === 'hail' ? 'Hail' : 'Wind'
}

function severityColor(score: number) {
  if (score >= 85) return 'bg-red-100 text-red-700 border-red-200'
  if (score >= 75) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (score >= 65) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-emerald-100 text-emerald-700 border-emerald-200'
}

export default function StormEventsPage() {
  const [events, setEvents] = useState<StormEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 7000)
    setLoading(true)

    fetch('/api/storm-events?limit=50', { signal: controller.signal })
      .then((res) => res.ok ? res.json() : { events: [] })
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => {
        clearTimeout(timeoutId)
        setLoading(false)
      })

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return events.filter((event) => {
      const typeMatch = filter === 'all' || event.type === filter
      const searchMatch = !query || formatStormType(event.type).toLowerCase().includes(query)
      return typeMatch && searchMatch
    })
  }, [events, filter, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-sm text-indigo-500 font-medium">
            Free weather tells you it hailed. TempestIQ tells you where the money is.
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Storm events for your regions</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Review storm impact windows, severity scoring, and affected neighborhoods so your team can move first.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/reports"
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:border-gray-300"
          >
            View reports library
          </Link>
          <Link
            href="/dashboard/scripts"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Launch outreach scripts
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {TYPE_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filter === item.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by storm type"
            className="w-full md:w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent storms</h2>
          <p className="text-sm text-gray-500 mt-1">Open a storm to see polygons, neighborhoods, and verification tools.</p>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading storms...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No storms found yet. Seed the mock data to populate this view.
          </div>
        ) : (
          <div className="divide-y">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${severityColor(event.severityScore)}`}>
                      Severity {event.severityScore}
                    </span>
                    <span className="text-sm text-gray-900 font-medium">{formatStormType(event.type)} storm</span>
                    <span className="text-xs text-gray-500">{new Date(event.startTime).toLocaleString()}</span>
                  </div>
                  <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div>
                      <span className="block text-xs uppercase tracking-wide text-gray-400">Impact window</span>
                      <span>{new Date(event.endTime).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wide text-gray-400">Max hail size</span>
                      <span>{event.maxHailSizeIn ? `${event.maxHailSizeIn}"` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wide text-gray-400">Max wind speed</span>
                      <span>{event.maxWindSpeedMph ? `${event.maxWindSpeedMph} mph` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wide text-gray-400">Impacted areas</span>
                      <span>{event.impactedAreaCount}</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Open Storm
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
