/**
 * Geocoding via OpenStreetMap Nominatim (free, no API key).
 * Use for address search -> lat/lng. Swap to Mapbox Geocoding later by changing this module.
 */

export interface GeocodeResult {
  lat: number
  lng: number
  displayName: string
  type?: string
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
    headers: { 'Accept-Language': 'en' },
  })
  if (!res.ok) return []
  const data = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
    type?: string
  }>
  return data.map((d) => ({
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
    displayName: d.display_name,
    type: d.type,
  }))
}
