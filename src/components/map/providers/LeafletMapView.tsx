'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  LayersControl,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { MapViewProps, MapMarker, MapMarkerIconType } from '@/lib/map/types'

import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'

const { BaseLayer } = LayersControl

// Fix default marker icon (Leaflet expects images at /dist path; we use CDN)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Custom icons by event/severity type (provider-agnostic iconType)
const ICON_COLORS: Record<MapMarkerIconType, { bg: string; border: string; symbol: string }> = {
  default: { bg: '#3388ff', border: '#2266cc', symbol: '📍' },
  hail: { bg: '#6366f1', border: '#4f46e5', symbol: '🧊' },
  wind: { bg: '#0ea5e9', border: '#0284c7', symbol: '💨' },
  tornado: { bg: '#dc2626', border: '#b91c1c', symbol: '🌪️' },
  extreme: { bg: '#b91c1c', border: '#991b1b', symbol: '⚠️' },
  moderate: { bg: '#eab308', border: '#ca8a04', symbol: '⚡' },
}

function getIconForMarker(m: MapMarker): L.DivIcon | undefined {
  const type = m.iconType ?? 'default'
  const { bg, border, symbol } = ICON_COLORS[type]
  return L.divIcon({
    className: 'custom-marker',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:${bg};border:2px solid ${border};border-radius:50%;color:white;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${symbol}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

// Child: add print + fullscreen controls to map instance (plugins extend L when loaded)
function MapControls({
  showPrint,
  showFullscreen,
}: {
  showPrint: boolean
  showFullscreen: boolean
}) {
  const map = useMap()
  const printRef = useRef<L.Control | null>(null)
  const fullscreenRef = useRef<L.Control | null>(null)

  useEffect(() => {
    let printCtrl: L.Control | null = null
    let fsCtrl: L.Control | null = null

    if (showPrint) {
      import('leaflet-easyprint').then(() => {
        const Lany = L as unknown as { easyPrint?: (opts?: object) => L.Control }
        if (Lany.easyPrint) {
          printCtrl = Lany.easyPrint({
            title: 'Print / export map',
            position: 'topleft',
            sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
          }).addTo(map)
          printRef.current = printCtrl
        }
      }).catch(() => {})
    }
    if (showFullscreen) {
      import('leaflet.fullscreen').then(() => {
        const Lcontrol = L.control as unknown as { fullscreen?: (opts?: object) => L.Control }
        if (Lcontrol.fullscreen) {
          fsCtrl = Lcontrol.fullscreen({ position: 'topright' }).addTo(map)
          fullscreenRef.current = fsCtrl
        }
      }).catch(() => {})
    }

    return () => {
      if (printRef.current) {
        map.removeControl(printRef.current)
        printRef.current = null
      }
      if (fullscreenRef.current) {
        map.removeControl(fullscreenRef.current)
        fullscreenRef.current = null
      }
    }
  }, [map, showPrint, showFullscreen])

  return null
}

// Lazy-load cluster so it only loads on client (uses window)
const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-cluster').then((m) => ({ default: m.default })),
  { ssr: false }
)

// Unique key per mount so Leaflet never sees "container already initialized" (React Strict Mode double-mount)
let mapContainerId = 0
function useMapContainerKey() {
  const [key] = useState(() => ++mapContainerId)
  return key
}

/**
 * Leaflet implementation of the shared map contract.
 * Supports: clustering, print, layer control, custom markers, fullscreen.
 */
export function LeafletMapView({
  center,
  zoom = 12,
  markers = [],
  bounds,
  polygons = [],
  className = '',
  height = '300px',
  interactive = true,
  clusterMarkers = markers.length > 5,
  showPrintControl = false,
  showLayerControl = interactive,
  showFullscreenControl = false,
}: MapViewProps) {
  const containerKey = useMapContainerKey()
  const position: [number, number] = useMemo(() => [center.lat, center.lng], [center.lat, center.lng])

  const markerElements = markers.map((m) => {
    const icon = getIconForMarker(m)
    return (
      <Marker key={m.id} position={[m.lat, m.lng]} icon={icon}>
        {m.popup != null && <Popup>{m.popup}</Popup>}
      </Marker>
    )
  })

  return (
    <div key={containerKey} className={className} style={{ height }}>
      <MapContainer
        center={position}
        zoom={zoom}
        className="h-full w-full rounded-lg z-0"
        style={{ height }}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
      >
        {showLayerControl ? (
          <LayersControl position="topright">
            <BaseLayer checked name="Street">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer name="Satellite">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </BaseLayer>
          </LayersControl>
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {clusterMarkers && markers.length > 1 ? (
          <MarkerClusterGroup>{markerElements}</MarkerClusterGroup>
        ) : (
          <>{markerElements}</>
        )}
        {polygons.map((polygon, i) =>
          polygon.map((ring, j) => {
            const latLngs: [number, number][] = ring.map((coord) => [coord[1], coord[0]])
            return <Polygon key={`${i}-${j}`} positions={latLngs} />
          })
        )}
        <MapControls showPrint={showPrintControl} showFullscreen={showFullscreenControl} />
      </MapContainer>
    </div>
  )
}
