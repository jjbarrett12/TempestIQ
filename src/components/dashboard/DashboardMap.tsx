'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapView } from '@/components/map/MapView'
import type { MapMarker } from '@/components/map/MapView'

interface Asset {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radiusMiles: number
  active: boolean
}

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 }
const DEFAULT_ZOOM = 4

export function DashboardMap({ customerId }: { customerId: string }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/assets?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setAssets(data.assets || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [customerId])

  const markers: MapMarker[] = assets
    .filter((a) => a.active)
    .map((a) => ({
      id: a.id,
      lat: a.latitude,
      lng: a.longitude,
      label: a.name,
      popup: `<strong>${a.name}</strong><br/>${a.address}<br/>${a.radiusMiles} mi radius`,
    }))

  const center =
    markers.length === 1
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : markers.length > 1
        ? {
            lat: markers.reduce((s, m) => s + m.lat, 0) / markers.length,
            lng: markers.reduce((s, m) => s + m.lng, 0) / markers.length,
          }
        : DEFAULT_CENTER

  const zoom = markers.length === 1 ? 12 : markers.length > 1 ? 6 : DEFAULT_ZOOM

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-indigo-200/60 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/80 to-sky-50/80 dark:from-indigo-900/40 dark:to-sky-900/40 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🗺️</span> Your coverage map
        </h2>
        <div className="h-64 rounded-xl bg-slate-200/60 dark:bg-slate-700 animate-pulse flex items-center justify-center text-slate-500 dark:text-gray-400 text-sm">
          Loading map…
        </div>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-indigo-200/60 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/80 to-sky-50/80 dark:from-indigo-900/40 dark:to-sky-900/40 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🗺️</span> Your coverage map
        </h2>
        <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-700/50 border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-3 text-slate-600 dark:text-gray-300">
          <p className="text-sm font-medium">No areas yet</p>
          <p className="text-xs text-slate-500 dark:text-gray-400">Add areas to see them on the map.</p>
          <Link
            href="/dashboard/areas/new"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Add area
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-indigo-200/60 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/80 to-sky-50/80 dark:from-indigo-900/40 dark:to-sky-900/40 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🗺️</span> Your coverage map
        </h2>
        <Link
          href="/dashboard/areas"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View all locations →
        </Link>
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-inner" style={{ height: 280 }}>
        <MapView
          center={center}
          zoom={zoom}
          markers={markers}
          height="100%"
          className="w-full"
          interactive={true}
          showLayerControl={false}
          showPrintControl={false}
          showFullscreenControl={true}
        />
      </div>
    </div>
  )
}
