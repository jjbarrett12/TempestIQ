'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'

type AlertEvent = {
  id: string
  site_id: string
  type: string
  severity: string
  status: string
  starts_at: string
  ends_at: string | null
  payload_json: Record<string, unknown> | null
  created_at: string
  push_sites: {
    id: string
    name: string
    latitude: number
    longitude: number
    radius_miles: number
  } | null
}

function formatType(type: string) {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatSeverity(severity: string) {
  const s = severity.toLowerCase()
  if (s === 'extreme') return { label: 'Extreme', color: 'text-red-700 bg-red-100' }
  if (s === 'high') return { label: 'High', color: 'text-orange-700 bg-orange-100' }
  if (s === 'moderate') return { label: 'Moderate', color: 'text-amber-700 bg-amber-100' }
  return { label: 'Low', color: 'text-gray-700 bg-gray-100' }
}

export default function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [alert, setAlert] = useState<AlertEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/alerts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((data) => {
        setAlert(data.alert)
        setLoading(false)
      })
      .catch(() => {
        setError('Alert not found')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading alert…</p>
      </div>
    )
  }

  if (error || !alert) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{error || 'Alert not found'}</p>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const site = alert.push_sites
  const sev = formatSeverity(alert.severity)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Link
          href="/dashboard"
          className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 inline-block"
        >
          ← Back to dashboard
        </Link>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {formatType(alert.type)} Alert
                </h1>
                {site && (
                  <p className="text-gray-600 mt-1">{site.name}</p>
                )}
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${sev.color}`}
              >
                {sev.label}
              </span>
            </div>
          </div>

          <dl className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex justify-between">
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="text-sm font-medium text-gray-900 capitalize">{alert.status}</dd>
            </div>
            <div className="px-6 py-4 flex justify-between">
              <dt className="text-sm text-gray-500">Started</dt>
              <dd className="text-sm text-gray-900">
                {new Date(alert.starts_at).toLocaleString()}
              </dd>
            </div>
            {alert.ends_at && (
              <div className="px-6 py-4 flex justify-between">
                <dt className="text-sm text-gray-500">Ends</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(alert.ends_at).toLocaleString()}
                </dd>
              </div>
            )}
            {site && (
              <div className="px-6 py-4 flex justify-between">
                <dt className="text-sm text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900">
                  {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)} (±{site.radius_miles} mi)
                </dd>
              </div>
            )}
          </dl>

          {alert.payload_json && Object.keys(alert.payload_json).length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Details</h2>
              <pre className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg overflow-auto max-h-48">
                {JSON.stringify(alert.payload_json, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
