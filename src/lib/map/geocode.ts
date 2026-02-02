/**
 * Geocoding via OpenStreetMap Nominatim (free, no API key).
 * Use for address search -> lat/lng. Swap to Mapbox Geocoding later by changing this module.
 */

export interface GeocodeResult {
  lat: number
  lng: number
  displayName: string
  type?: string
  bbox?: [number, number, number, number] // [south, north, west, east]
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export async function geocodeAddress(
  query: string,
  options?: { limit?: number; countrycodes?: string }
): Promise<GeocodeResult[]> {
  if (!query?.trim()) return []
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: String(options?.limit ?? 5),
  })
  if (options?.countrycodes) params.set('countrycodes', options.countrycodes)

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'TempestIQ/1.0 (https://tempestiq.com)' },
  })
  if (!res.ok) return []
  const data = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
    type?: string
    boundingbox?: [string, string, string, string]
  }>
  return data.map((d) => {
    const bbox = d.boundingbox
      ? ([
          parseFloat(d.boundingbox[0]),
          parseFloat(d.boundingbox[1]),
          parseFloat(d.boundingbox[2]),
          parseFloat(d.boundingbox[3]),
        ] as [number, number, number, number])
      : undefined
    return {
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
      displayName: d.display_name,
      type: d.type,
      bbox,
    }
  })
}

/** Geocode a single place (ZIP, county, city). Returns first result with optional bbox. */
export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  const results = await geocodeAddress(query, { limit: 1 })
  return results[0] ?? null
}

const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

/** Reverse geocode lat/lng to a readable place name (city, region, etc.) */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      format: 'json',
      lat: String(lat),
      lon: String(lng),
      zoom: '10',
      addressdetails: '1',
    })
    const res = await fetch(`${NOMINATIM_REVERSE}?${params}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'TempestIQ/1.0' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { address?: Record<string, string>; display_name?: string }
    const addr = data.address
    if (addr?.city) return `${addr.city}, ${addr.state || addr.county || ''}`.trim()
    if (addr?.town || addr?.village) return `${addr.town || addr.village}, ${addr.state || addr.county || ''}`.trim()
    if (addr?.county && addr?.state) return `${addr.county}, ${addr.state}`
    return data.display_name?.split(',').slice(0, 2).join(',').trim() ?? null
  } catch {
    return null
  }
}

/** Convert bbox [south,north,west,east] to GeoJSON Polygon */
export function bboxToGeoJSON(bbox: [number, number, number, number]): { type: 'Polygon'; coordinates: number[][][] } {
  const [south, north, west, east] = bbox
  return {
    type: 'Polygon',
    coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]],
  }
}
