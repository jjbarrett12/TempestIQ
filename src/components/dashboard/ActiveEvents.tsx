'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  eventType: string
  severity: string
  startTime: string
  endTime?: string
  latitude: number
  longitude: number
  asset?: {
    name: string
    address: string
  }
}

const SAFETY_EVENT_TYPES = ['HIGH_WIND_WARNING', 'EXTREME_WIND_GUST', 'TORNADO_WARNING', 'TORNADO_WATCH', 'SEVERE_TSTORM_WARNING']
function isSafetyEvent(eventType: string) {
  return SAFETY_EVENT_TYPES.includes(eventType)
}

export function ActiveEvents({ customerId }: { customerId: string }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = () => {
      fetch(`/api/events?customerId=${customerId}&status=ACTIVE&limit=10`)
        .then(res => res.json())
        .then(data => {
          setEvents(data.events || [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch events:', err)
          setLoading(false)
        })
    }

    fetchEvents()
    const interval = setInterval(fetchEvents, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [customerId])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'EXTREME':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getEventTypeName = (type: string) => {
    const names: Record<string, string> = {
      HAIL_THREAT: 'Hail Threat',
      TORNADO_WARNING: '🚨 Tornado Warning',
      TORNADO_WATCH: 'Tornado Watch',
      SEVERE_TSTORM_WARNING: 'Severe Thunderstorm Warning',
      HIGH_WIND_WARNING: 'High Wind Warning',
      EXTREME_WIND_GUST: 'Extreme Wind Gust',
    }
    return names[type] || type
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Active Threats</h2>
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Active Threats</h2>
      </div>
      <div className="divide-y">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No active threats</p>
            <p className="text-sm text-gray-500 mt-1">When storms hit your locations, they’ll appear here.</p>
            <Link href="/dashboard/assets" className="inline-block mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">
              Manage locations →
            </Link>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="p-6">
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <span className={`px-3 py-1 rounded border text-sm font-semibold ${getSeverityColor(event.severity)}`}>
                  {getEventTypeName(event.eventType)}
                </span>
                <div className="flex items-center gap-2">
                  {isSafetyEvent(event.eventType) && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                      Safety
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(event.startTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {event.asset && (
                <p className="text-gray-700 text-sm mt-2">
                  {event.asset.name} • {event.asset.address}
                </p>
              )}
              {event.endTime && (
                <p className="text-gray-500 text-xs mt-1">
                  Expires: {new Date(event.endTime).toLocaleString()}
                </p>
              )}
              <Link
                href={`/dashboard/events/${event.id}`}
                className="inline-block mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View storm verification →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
