'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

export default function ReportGeneratorPage() {
  const searchParams = useSearchParams()
  const stormId = searchParams.get('stormId')
  const [event, setEvent] = useState<StormEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAddress, setSelectedAddress] = useState<GeocodeResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ReportResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!stormId) {
      setLoading(false)
      return
    }
    fetch(`/api/storm-events/${stormId}`)
      .then((res) => res.ok ? res.json() : { event: null })
      .then((data) => setEvent(data.event ?? null))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [stormId])

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

  const handleGenerate = async () => {
    if (!event || !selectedAddress) return
    setSubmitting(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stormEventId: event.id,
          address: selectedAddress.displayName,
          lat: selectedAddress.lat,
          lon: selectedAddress.lng,
        }),
      })
      const data = (await res.json()) as ReportResponse
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Unable to generate report.')
        return
      }
      setResult(data)
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
      <div className="max-w-xl mx-auto py-12 text-center">
        <p className="text-gray-600">Select a storm to generate a report.</p>
        <Link href="/dashboard/events" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
          Back to storms
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
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:border-gray-300"
        >
          View reports library
        </Link>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
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
              onClick={handleGenerate}
              disabled={!selectedAddress || submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Generating…' : 'Generate Verification Report'}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
