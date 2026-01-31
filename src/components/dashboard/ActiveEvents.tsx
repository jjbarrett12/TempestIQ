'use client'

import { useState, useEffect } from 'react'

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
          <div className="p-6 text-gray-500 text-center">
            No active threats at this time
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-3 py-1 rounded border text-sm font-semibold ${getSeverityColor(event.severity)}`}>
                  {getEventTypeName(event.eventType)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(event.startTime).toLocaleTimeString()}
                </span>
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
