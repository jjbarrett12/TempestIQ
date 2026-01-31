'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapView } from '@/components/map/MapView'
import type { MapMarkerIconType } from '@/lib/map/types'

function eventIconType(eventType: string, severity: string): MapMarkerIconType {
  if (eventType.includes('TORNADO')) return 'tornado'
  if (eventType.includes('HAIL')) return 'hail'
  if (eventType.includes('WIND') || eventType.includes('GUST')) return 'wind'
  if (severity === 'EXTREME') return 'extreme'
  if (severity === 'MODERATE' || severity === 'HIGH') return 'moderate'
  return 'default'
}

interface Event {
  id: string
  eventType: string
  severity: string
  startTime: string
  endTime: string | null
  latitude: number
  longitude: number
  source: string
  sourceEventId: string | null
  asset?: { name: string; address: string } | null
}

const EVENT_TYPE_NAMES: Record<string, string> = {
  HAIL_THREAT: 'Hail',
  TORNADO_WARNING: 'Tornado Warning',
  TORNADO_WATCH: 'Tornado Watch',
  SEVERE_TSTORM_WARNING: 'Severe Thunderstorm',
  HIGH_WIND_WARNING: 'High Wind',
  EXTREME_WIND_GUST: 'Extreme Wind Gust',
}

export default function StormProofPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setEvent(data.event || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-gray-500">
        Loading storm verification…
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-600">Event not found.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const startDate = new Date(event.startTime)
  const endDate = event.endTime ? new Date(event.endTime) : null
  const mapUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          ← Back to dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden print:border print:shadow-none">
        <div className="px-6 py-5 border-b bg-gray-50">
          <h1 className="text-xl font-bold text-gray-900">Storm verification</h1>
          <p className="text-sm text-gray-600 mt-1">
            Time-stamped event record for insurance, adjusters, or homeowner proof.
          </p>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event type</span>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {EVENT_TYPE_NAMES[event.eventType] || event.eventType}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start time (local)</span>
            <p className="text-gray-900 mt-0.5">
              {startDate.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>
          {endDate && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End time</span>
              <p className="text-gray-900 mt-0.5">
                {endDate.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
          )}
          {event.asset && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</span>
              <p className="text-gray-900 mt-0.5">
                {event.asset.name} — {event.asset.address}
              </p>
            </div>
          )}
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coordinates</span>
            <p className="text-gray-900 mt-0.5">
              {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}
              {' · '}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                View on Google Maps
              </a>
            </p>
          </div>
          <div className="mt-4 print:hidden">
            <MapView
              center={{ lat: event.latitude, lng: event.longitude }}
              zoom={14}
              markers={[
                {
                  id: event.id,
                  lat: event.latitude,
                  lng: event.longitude,
                  popup: EVENT_TYPE_NAMES[event.eventType] || event.eventType,
                  iconType: eventIconType(event.eventType, event.severity),
                },
              ]}
              height="280px"
              className="rounded-lg overflow-hidden border border-gray-200"
              showPrintControl
              showFullscreenControl
            />
          </div>
          <div className="pt-4 border-t text-xs text-gray-500">
            Source: {event.source}
            {event.sourceEventId && ` · ID: ${event.sourceEventId}`}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center print:hidden">
        Print this page (Ctrl+P / Cmd+P) for a PDF-style storm verification.
      </p>
    </div>
  )
}
