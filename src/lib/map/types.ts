/**
 * Provider-agnostic map types.
 * Use these everywhere; swap Leaflet → Mapbox by changing the provider implementation only.
 */

export interface MapCenter {
  lat: number
  lng: number
}

/** Icon type for custom markers (e.g. by event type or severity). Provider maps these to visuals. */
export type MapMarkerIconType = 'default' | 'hail' | 'wind' | 'tornado' | 'extreme' | 'moderate'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  label?: string
  /** Optional popup/tooltip content (plain text or HTML string depending on provider) */
  popup?: string
  /** Optional: custom icon by type (hail, wind, tornado, severity). Defaults to 'default'. */
  iconType?: MapMarkerIconType
}

/** Bounding box for fitBounds / viewport */
export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

/** Polygon as array of [lng, lat] (GeoJSON order) per ring; first ring = outer */
export type MapPolygon = Array<Array<[number, number]>>

export interface MapViewProps {
  /** Center of the map */
  center: MapCenter
  /** Initial zoom (e.g. 10–16). Provider-specific but comparable. */
  zoom?: number
  /** Markers to show */
  markers?: MapMarker[]
  /** Optional: fit view to this bounds instead of center+zoom */
  bounds?: MapBounds
  /** Optional: polygon(s) to draw (e.g. storm boundary) */
  polygons?: MapPolygon[]
  /** CSS class for the container */
  className?: string
  /** Height (e.g. "300px", "100%") */
  height?: string
  /** Disable user pan/zoom */
  interactive?: boolean
  /** Cluster markers when many (e.g. > 5). Default true when markers.length > 5. */
  clusterMarkers?: boolean
  /** Show print/export map button. Default false. */
  showPrintControl?: boolean
  /** Show base layer switcher (e.g. Street vs Satellite). Default true for interactive maps. */
  showLayerControl?: boolean
  /** Show fullscreen button. Default false. */
  showFullscreenControl?: boolean
}
