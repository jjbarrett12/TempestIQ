'use client'

import dynamic from 'next/dynamic'
import type { MapViewProps } from '@/lib/map/types'

/**
 * Provider-agnostic map. Uses Leaflet by default.
 * To switch to Mapbox: implement MapboxMapView with the same MapViewProps,
 * then change the dynamic import below to MapboxMapView (or use env: NEXT_PUBLIC_MAP_PROVIDER).
 */
const LeafletMapView = dynamic(
  () => import('./providers/LeafletMapView').then((m) => m.LeafletMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-lg" style={{ minHeight: 200 }}>
        Loading map…
      </div>
    ),
  }
)

export type { MapViewProps, MapCenter, MapMarker, MapBounds, MapPolygon } from '@/lib/map/types'

export function MapView(props: MapViewProps) {
  return <LeafletMapView {...props} />
}
