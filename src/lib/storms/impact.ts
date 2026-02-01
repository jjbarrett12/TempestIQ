import type { GeoJsonPolygon } from '@/lib/storms/mock-data'

type LatLng = { lat: number; lng: number }

function haversineMeters(a: LatLng, b: LatLng) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function pointInPolygon(point: LatLng, polygon: GeoJsonPolygon) {
  const ring = polygon.coordinates[0]
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + Number.EPSILON) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function isPointImpacted(point: LatLng, polygons: GeoJsonPolygon[]) {
  return polygons.some((polygon) => pointInPolygon(point, polygon))
}

export function distanceToPolygonsMeters(point: LatLng, polygons: GeoJsonPolygon[]) {
  let min = Number.POSITIVE_INFINITY
  polygons.forEach((polygon) => {
    polygon.coordinates[0].forEach(([lng, lat]) => {
      const distance = haversineMeters(point, { lat, lng })
      if (distance < min) min = distance
    })
  })
  return min === Number.POSITIVE_INFINITY ? null : min
}
