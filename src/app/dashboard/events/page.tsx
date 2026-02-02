'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  groupEvents,
  severityToBucket,
  severityBucketColor,
  confidenceToLabel,
} from '@/lib/alerts/helpers'

type StormEvent = {
  id: string
  type: 'hail' | 'wind'
  startTime: string
  endTime: string
  maxHailSizeIn: number | null
  maxWindSpeedMph: number | null
  impactedAreaCount: number
  severityScore: number
  ai_explanation?: string
  providers_used?: string[]
  confidence?: number
  centroid?: { lat: number; lng: number }
  assetId?: string | null
  isTestAlert?: boolean
}

const TYPE_FILTERS = [
  { label: 'All storms', value: 'all' },
  { label: 'Hail', value: 'hail' },
  { label: 'Wind', value: 'wind' },
]

function formatStormType(type: string) {
  return type === 'hail' ? 'Hail' : 'Wind'
}

export default function StormEventsPage() {
  const [events, setEvents] = useState<StormEvent[]>([])
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [seeding, setSeeding] = useState(false)

  const loadSampleStorms = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/storm-events/seed', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        const controller = new AbortController()
        fetch('/api/storm-events?limit=50', { signal: controller.signal })
          .then((r) => r.ok ? r.json() : { events: [] })
          .then((d) => {
            setEvents(d.events ?? [])
            setLastCheckedAt(d.lastCheckedAt ?? null)
          })
      }
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 7000)
    setLoading(true)

    fetch('/api/storm-events?limit=50', { signal: controller.signal })
      .then((res) => res.ok ? res.json() : { events: [], lastCheckedAt: null })
      .then((data) => {
        setEvents(data.events ?? [])
        setLastCheckedAt(data.lastCheckedAt ?? null)
      })
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

  const grouped = useMemo(() => groupEvents(filteredEvents, 24), [filteredEvents])
  const severeCount = useMemo(
    () => filteredEvents.filter((e) => severityToBucket(e.severityScore) === 'Severe').length,
    [filteredEvents]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-sm text-indigo-500 dark:text-indigo-400 font-medium">
            Free weather tells you it hailed. TempestIQ tells you where the money is.
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Storm events for your regions</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Review storm impact windows, severity scoring, and affected neighborhoods so your team can move first.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/reports"
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-gray-300 dark:hover:border-slate-500"
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

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
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
                    : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-500'
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
            className="w-full md:w-64 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-slate-400"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent storms</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Open a storm to see polygons, neighborhoods, and verification tools.</p>
            </div>
            {!loading && filteredEvents.length > 0 && (
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
                Active alerts: {filteredEvents.length} · Severe: {severeCount}
              </p>
            )}
          </div>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading…</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">✅ You&apos;re protected.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">No active threats detected in your areas.</p>
            {lastCheckedAt && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Last checked {new Date(lastCheckedAt).toLocaleString()}</p>
            )}
            <button
              type="button"
              onClick={loadSampleStorms}
              disabled={seeding}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {seeding ? 'Loading…' : 'Load sample storms'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {grouped.map(({ primary: event, updates, severityIncreased }) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="block p-5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0" aria-hidden>
                    {event.type === 'hail' ? '🧊' : '💨'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatStormType(event.type)} storm</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityBucketColor(severityToBucket(event.severityScore))}`}>
                        {severityToBucket(event.severityScore)}
                      </span>
                      {event.isTestAlert && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">
                          Test
                        </span>
                      )}
                      {updates > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                          +{updates} updates
                        </span>
                      )}
                      {severityIncreased && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                          Severity increased
                        </span>
                      )}
                    </div>
                    {event.ai_explanation && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 line-clamp-2">{event.ai_explanation}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {confidenceToLabel(event.confidence)} confidence
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Impact: {new Date(event.endTime).toLocaleTimeString()}</span>
                      {event.maxHailSizeIn != null && <span>Hail: {event.maxHailSizeIn}"</span>}
                      {event.maxWindSpeedMph != null && <span>Wind: {event.maxWindSpeedMph} mph</span>}
                      <span>{event.impactedAreaCount} areas</span>
                    </div>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex-shrink-0">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
