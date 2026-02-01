'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MapView } from '@/components/map/MapView'
import type { MapPolygon } from '@/components/map/MapView'

type StormPolygon = {
  id: string
  geojson: {
    type: 'Polygon'
    coordinates: Array<Array<[number, number]>>
  }
  maxHailSizeIn?: number
  maxWindSpeedMph?: number
  impactedNeighborhoods: string[]
}

type StormEvent = {
  id: string
  type: 'hail' | 'wind'
  startTime: string
  endTime: string
  severityScore: number
  maxHailSizeIn: number | null
  maxWindSpeedMph: number | null
  impactedAreaCount: number
  polygons: StormPolygon[]
  centroid: { lat: number; lng: number }
}

const RECOMMENDED_ACTIONS = [
  'Assign top crews to highest severity polygons first',
  'Pull lead list for impacted neighborhoods and prioritize outreach',
  'Generate verification reports for top-tier prospects',
  'Launch SMS/email scripts within 60 minutes of impact',
]

function formatStormType(type: StormEvent['type']) {
  return type === 'hail' ? 'Hail' : 'Wind'
}

function toMapPolygons(polygons: StormPolygon[]) {
  return polygons.map((polygon) => polygon.geojson.coordinates as MapPolygon)
}

export default function StormDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<StormEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null)
  const [showHail, setShowHail] = useState(true)
  const [showWind, setShowWind] = useState(true)

  useEffect(() => {
    fetch(`/api/storm-events/${params.id}`)
      .then((r) => r.ok ? r.json() : { event: null })
      .then((data) => {
        setEvent(data.event || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const selectedPolygon = useMemo(
    () => event?.polygons.find((polygon) => polygon.id === selectedPolygonId) ?? null,
    [event, selectedPolygonId]
  )

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-gray-500">
        Loading storm detail…
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-600">Storm not found.</p>
        <Link href="/dashboard/events" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
          Back to storms
        </Link>
      </div>
    )
  }

  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)
  const showPolygons = event.polygons.filter((polygon) => {
    if (event.type === 'hail') return showHail
    return showWind
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <Link href="/dashboard/events" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to storms
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {formatStormType(event.type)} storm impact detail
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Impact window: {startDate.toLocaleString()} – {endDate.toLocaleString()}
          </p>
        </div>
        <Link
          href={`/dashboard/reports/new?stormId=${event.id}`}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Generate Verification Report
        </Link>
      </div>

      <div className="grid lg:grid-cols-[2.2fr_1fr] gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Storm polygons</p>
              <p className="text-sm text-slate-600">Toggle layers or select a polygon to see impact details.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHail((prev) => !prev)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  showHail ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Hail layer
              </button>
              <button
                type="button"
                onClick={() => setShowWind((prev) => !prev)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  showWind ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Wind layer
              </button>
            </div>
          </div>
          <div className="p-4">
            <MapView
              center={event.centroid}
              zoom={9}
              polygons={toMapPolygons(showPolygons)}
              height="420px"
              className="rounded-xl overflow-hidden border border-gray-200"
              showFullscreenControl
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Storm stats</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Severity score</span>
                <span className="font-semibold text-slate-900">{event.severityScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max hail size</span>
                <span className="font-semibold text-slate-900">{event.maxHailSizeIn ? `${event.maxHailSizeIn}"` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max wind speed</span>
                <span className="font-semibold text-slate-900">{event.maxWindSpeedMph ? `${event.maxWindSpeedMph} mph` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Impacted areas</span>
                <span className="font-semibold text-slate-900">{event.impactedAreaCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Affected neighborhoods</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {(selectedPolygon?.impactedNeighborhoods ?? event.polygons[0]?.impactedNeighborhoods ?? []).map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <span>{name}</span>
                  <span className="text-xs text-slate-500">High priority</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Recommended actions</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {RECOMMENDED_ACTIONS.map((action) => (
                <li key={action} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Storm polygons</p>
        <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm text-slate-700">
          {event.polygons.map((polygon, index) => (
            <button
              key={polygon.id}
              type="button"
              onClick={() => setSelectedPolygonId(polygon.id)}
              className={`text-left p-3 rounded-xl border transition-colors ${
                polygon.id === selectedPolygonId ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200'
              }`}
            >
              <p className="font-semibold text-slate-900">Polygon {index + 1}</p>
              <p className="text-xs text-slate-500 mt-1">{polygon.impactedNeighborhoods.length} neighborhoods impacted</p>
              <p className="text-xs text-slate-500">
                {polygon.maxHailSizeIn ? `Hail ${polygon.maxHailSizeIn}"` : 'Hail N/A'} · Wind {polygon.maxWindSpeedMph ?? 'N/A'} mph
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
