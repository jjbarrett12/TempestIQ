'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { GeocodeSearch } from '@/components/map/GeocodeSearch'
import { MapView } from '@/components/map/MapView'
import type { GeocodeResult } from '@/lib/map/geocode'
import type { MapMarker, MapPolygon } from '@/components/map/MapView'

type StormEvent = {
  id: string
  type: 'hail' | 'wind'
  startTime: string
  endTime: string
  severityScore: number
  maxHailSizeIn: number | null
  maxWindSpeedMph: number | null
  impactedAreaCount: number
  polygons: Array<{ geojson: { coordinates: Array<Array<[number, number]>> } }>
  centroid: { lat: number; lng: number }
}

type ReportResponse = {
  report: {
    id: string
    impacted: boolean
    distanceToPolygonM: number | null
  }
  pdfUrl: string
}

function miles(meters: number | null) {
  if (meters == null) return 'N/A'
  return `${(meters / 1609.34).toFixed(1)} mi`
}

type StormSummary = { id: string; type: string; startTime: string; severityScore: number }

export default function ReportGeneratorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stormId = searchParams.get('stormId')
  const [event, setEvent] = useState<StormEvent | null>(null)
  const [storms, setStorms] = useState<StormSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<GeocodeResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ReportResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!stormId) {
      setLoading(false)
      fetch('/api/storm-events?limit=20')
        .then((r) => r.ok ? r.json() : { events: [] })
        .then((d) => setStorms(d.events ?? []))
        .catch(() => setStorms([]))
      return
    }
    setLoading(true)
    fetch(`/api/storm-events/${stormId}`)
      .then((res) => res.ok ? res.json() : { event: null })
      .then((data) => setEvent(data.event ?? null))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [stormId])

  const loadSampleStorms = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/storm-events/seed', { method: 'POST' })
      if (res.ok) {
        const d = await fetch('/api/storm-events?limit=20').then((r) => r.json())
        setStorms(d.events ?? [])
        const first = (d.events ?? [])[0]
        if (first) router.push(`/dashboard/reports/new?stormId=${first.id}`)
      }
    } finally {
      setSeeding(false)
    }
  }

  const polygons = useMemo(() => {
    return event?.polygons.map((polygon) => polygon.geojson.coordinates as MapPolygon) ?? []
  }, [event])

  const markers = useMemo<MapMarker[]>(() => {
    if (!selectedAddress) return []
    return [
      {
        id: 'address',
        lat: selectedAddress.lat,
        lng: selectedAddress.lng,
        popup: selectedAddress.displayName,
        iconType: 'default',
      },
    ]
  }, [selectedAddress])

  const handleGenerate = async (useAddress = false) => {
    if (!event) return
    if (useAddress && !selectedAddress) return
    setSubmitting(true)
    setError('')
    setResult(null)
    try {
      const payload = useAddress && selectedAddress
        ? { stormEventId: event.id, address: selectedAddress.displayName, lat: selectedAddress.lat, lon: selectedAddress.lng }
        : { stormEventId: event.id }
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as ReportResponse
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Unable to generate report.')
        return
      }
      setResult(data)
      if (data.pdfUrl) {
        const pdfRes = await fetch(data.pdfUrl, { credentials: 'include' })
        if (!pdfRes.ok) {
          const err = await pdfRes.json().catch(() => ({}))
          setError((err as { error?: string }).error ?? 'PDF failed to load.')
          return
        }
        const blob = await pdfRes.blob()
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    } catch {
      setError('Unable to generate report.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading report generator…</div>
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Link href="/dashboard/reports" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          ← Back to reports
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Generate verification report</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Select a storm to generate a report.</p>
        {storms.length === 0 ? (
          <div className="mt-6 p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">No storms yet.</p>
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
          <div className="mt-6 space-y-2">
            {storms.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => router.push(`/dashboard/reports/new?stormId=${s.id}`)}
                className="block w-full text-left p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {s.type.toUpperCase()} · Severity {s.severityScore}
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {new Date(s.startTime).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
        <Link href="/dashboard/events" className="mt-6 inline-block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          View all storms →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <Link href={`/dashboard/events/${event.id}`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to storm detail
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Generate verification report</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Enter a property address to verify storm impact and generate a professional report for homeowners and adjusters.
          </p>
        </div>
        <Link
          href="/dashboard/reports"
          className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-gray-300 dark:hover:border-slate-500"
        >
          View reports library
        </Link>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Property address</p>
            <GeocodeSearch
              onSelect={setSelectedAddress}
              placeholder="Search property address"
              className="mt-2"
            />
          </div>
          <MapView
            center={selectedAddress ? { lat: selectedAddress.lat, lng: selectedAddress.lng } : event.centroid}
            zoom={selectedAddress ? 12 : 9}
            polygons={polygons}
            markers={markers}
            height="360px"
            className="rounded-xl overflow-hidden border border-gray-200"
            showFullscreenControl
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Generating…' : 'Generate PDF Report'}
            </button>
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={!selectedAddress || submitting}
              className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 text-sm font-medium hover:bg-indigo-50 disabled:opacity-50"
            >
              Generate for address
            </button>
            {selectedAddress && (
              <span className="text-xs text-gray-500">
                Selected: {selectedAddress.displayName}
              </span>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Storm summary</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Storm type</span>
                <span className="font-semibold">{event.type.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Severity score</span>
                <span className="font-semibold">{event.severityScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max hail size</span>
                <span className="font-semibold">{event.maxHailSizeIn ? `${event.maxHailSizeIn}"` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max wind speed</span>
                <span className="font-semibold">{event.maxWindSpeedMph ? `${event.maxWindSpeedMph} mph` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Impacted areas</span>
                <span className="font-semibold">{event.impactedAreaCount}</span>
              </div>
            </div>
          </div>

          {result && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Verification result</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p className="font-semibold">
                  {result.report.impacted ? 'Confirmed impact zone' : 'Not in confirmed impact zone'}
                </p>
                {!result.report.impacted && (
                  <p className="text-xs text-slate-500">
                    Nearest confirmed zone: {miles(result.report.distanceToPolygonM)}
                  </p>
                )}
                <Link
                  href={result.pdfUrl}
                  target="_blank"
                  className="inline-flex mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Download PDF report
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
