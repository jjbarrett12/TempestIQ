'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MapView } from '@/components/map/MapView'
import type { MapPolygon } from '@/components/map/MapView'
import { confidenceToLabel, severityToBucket, severityBucketColor } from '@/lib/alerts/helpers'

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
  ai_explanation?: string
  providers_used?: string[]
  confidence?: number
  isTestAlert?: boolean
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

export default function StormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<StormEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null)
  const [showHail, setShowHail] = useState(true)
  const [showWind, setShowWind] = useState(true)
  const [emailingTeam, setEmailingTeam] = useState(false)
  const [emailTeamMessage, setEmailTeamMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/storm-events/${id}`)
      .then((r) => r.ok ? r.json() : { event: null })
      .then((data) => {
        setEvent(data.event || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const selectedPolygon = useMemo(
    () => event?.polygons.find((polygon) => polygon.id === selectedPolygonId) ?? null,
    [event, selectedPolygonId]
  )

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-gray-500 dark:text-gray-400">
        Loading storm detail…
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Storm not found.</p>
        <Link href="/dashboard/events" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
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
          <Link href="/dashboard/events" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
            ← Back to storms
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {formatStormType(event.type)} storm impact detail
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Impact window: {startDate.toLocaleString()} – {endDate.toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={emailingTeam}
            onClick={async () => {
              setEmailTeamMessage(null)
              setEmailingTeam(true)
              try {
                const res = await fetch(`/api/storm-events/${event.id}/email-team`, { method: 'POST' })
                const data = await res.json().catch(() => ({}))
                if (res.ok && data.sent !== undefined) {
                  setEmailTeamMessage({
                    type: 'success',
                    text: data.message || `Sent to ${data.sent} team member(s).`,
                  })
                } else {
                  setEmailTeamMessage({
                    type: 'error',
                    text: data.error || 'Failed to send. Add team members in Settings.',
                  })
                }
              } catch {
                setEmailTeamMessage({ type: 'error', text: 'Failed to send.' })
              } finally {
                setEmailingTeam(false)
              }
            }}
            className="px-4 py-2 rounded-lg border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-medium disabled:opacity-50"
          >
            {emailingTeam ? 'Sending…' : 'Email team'}
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/reports', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ stormEventId: event.id }),
                })
                const data = await res.json()
                if (!res.ok) {
                  alert(data.error || 'Could not generate report')
                  return
                }
                if (data.pdfUrl) {
                  const pdfRes = await fetch(data.pdfUrl, { credentials: 'include' })
                  if (pdfRes.ok) {
                    const blob = await pdfRes.blob()
                    window.open(URL.createObjectURL(blob), '_blank')
                  } else {
                    alert('PDF failed to load. Try again.')
                  }
                }
                else alert(data.error || 'Could not generate report')
              } catch {
                alert('Could not generate report')
              }
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Generate PDF Report
          </button>
          <Link
            href={`/dashboard/reports/new?stormId=${event.id}`}
            className="px-4 py-2 rounded-lg border-2 border-indigo-600 text-indigo-600 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            Report for address
          </Link>
        </div>
      </div>

      {emailTeamMessage && (
        <div
          className={`p-4 rounded-xl text-sm ${
            emailTeamMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
          }`}
          role="alert"
        >
          {emailTeamMessage.text}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-indigo-50/50 dark:bg-indigo-900/20 p-4">
        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Why did I get this alert?</p>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
          {event.ai_explanation || `Severity ${event.severityScore}. ${event.type === 'hail' && event.maxHailSizeIn ? `Max hail ${event.maxHailSizeIn}".` : ''} ${event.type === 'wind' && event.maxWindSpeedMph ? `Max wind ${event.maxWindSpeedMph} mph.` : ''}`}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
            confidenceToLabel(event.confidence) === 'High' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' :
            confidenceToLabel(event.confidence) === 'Med' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' :
            'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-gray-300'
          }`}>
            {confidenceToLabel(event.confidence)} confidence
          </span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${severityBucketColor(severityToBucket(event.severityScore))}`}>
            {severityToBucket(event.severityScore)}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2.2fr_1fr] gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">Storm polygons</p>
              <p className="text-sm text-slate-600 dark:text-gray-300">Toggle layers or select a polygon to see impact details.</p>
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
                  showWind ? 'bg-sky-600 text-white border-sky-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-slate-600'
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
                <span className="font-semibold text-slate-900 dark:text-white">{event.severityScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max hail size</span>
                <span className="font-semibold text-slate-900 dark:text-white">{event.maxHailSizeIn ? `${event.maxHailSizeIn}"` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max wind speed</span>
                <span className="font-semibold text-slate-900 dark:text-white">{event.maxWindSpeedMph ? `${event.maxWindSpeedMph} mph` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Impacted areas</span>
                <span className="font-semibold text-slate-900 dark:text-white">{event.impactedAreaCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">Affected neighborhoods</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-gray-300">
              {[...new Set(selectedPolygon?.impactedNeighborhoods ?? event.polygons[0]?.impactedNeighborhoods ?? [])].map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <span>{name}</span>
                  <span className="text-xs text-slate-500">High priority</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">Recommended actions</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-gray-300">
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

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">Storm polygons</p>
        <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-gray-300">
          {event.polygons.map((polygon, index) => (
            <button
              key={polygon.id}
              type="button"
              onClick={() => setSelectedPolygonId(polygon.id)}
              className={`text-left p-3 rounded-xl border transition-colors ${
                polygon.id === selectedPolygonId ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/40' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-500'
              }`}
            >
              <p className="font-semibold text-slate-900 dark:text-white">Polygon {index + 1}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{polygon.impactedNeighborhoods.length} neighborhoods impacted</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {polygon.maxHailSizeIn ? `Hail ${polygon.maxHailSizeIn}"` : 'Hail N/A'} · Wind {polygon.maxWindSpeedMph ?? 'N/A'} mph
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
