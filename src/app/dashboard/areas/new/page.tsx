'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GeocodeSearch } from '@/components/map/GeocodeSearch'
import type { GeocodeResult } from '@/lib/map/geocode'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'
import { bboxToGeoJSON } from '@/lib/map/geocode'

type Mode = 'address' | 'zip' | 'import'

const RADIUS_PRESETS = [5, 10, 15, 25, 50]
const DEFAULT_RADIUS = 25
const GEO_SUGGEST_KEY = 'tempestiq_geo_suggest_shown'

function useGeolocation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported')
        resolve(null)
        return
      }
      setLoading(true)
      setError(null)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false)
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          setLoading(false)
          setError('Could not get location')
          resolve(null)
        }
      )
    })
  }

  return { getLocation, loading, error }
}

export default function NewAreaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = useDashboardCustomer()
  const modeParam = searchParams.get('mode') as Mode | null
  const [mode, setMode] = useState<Mode>(modeParam && ['address','zip','import'].includes(modeParam) ? modeParam : 'address')
  const [geoPromptShown, setGeoPromptShown] = useState(false)

  useEffect(() => {
    if (mode === 'address' && typeof window !== 'undefined' && !sessionStorage.getItem(GEO_SUGGEST_KEY)) {
      setGeoPromptShown(true)
    }
  }, [mode])
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS)
  const [displayLabel, setDisplayLabel] = useState('')
  const [geometry, setGeometry] = useState<Record<string, unknown> | null>(null)
  const [importText, setImportText] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const { getLocation, loading: geoLoading, error: geoError } = useGeolocation()

  const handleGeocodeSelect = (r: GeocodeResult) => {
    setAddress(r.displayName)
    setDisplayLabel(r.displayName)
    setLatitude(String(r.lat))
    setLongitude(String(r.lng))
    if (r.bbox) {
      setGeometry(bboxToGeoJSON(r.bbox))
    } else {
      setGeometry(null)
    }
  }

  const handleUseLocation = async () => {
    const loc = await getLocation()
    if (loc) {
      setLatitude(String(loc.lat))
      setLongitude(String(loc.lng))
      setDisplayLabel('Current location')
      sessionStorage.setItem(GEO_SUGGEST_KEY, '1')
      setGeoPromptShown(false)
    }
  }

  const dismissGeoPrompt = () => {
    sessionStorage.setItem(GEO_SUGGEST_KEY, '1')
    setGeoPromptShown(false)
  }

  const createArea = async (data: {
    address: string
    latitude: number
    longitude: number
    radiusMiles: number
    name?: string
    displayLabel?: string
    geometry?: Record<string, unknown> | null
    type?: string
    source?: string
  }) => {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        ...data,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create area')
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createArea({
        address: address || (e.target as HTMLFormElement).address?.value,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMiles,
        displayLabel: displayLabel || address,
        geometry: geometry ?? undefined,
        type: 'POINT_RADIUS',
        source: 'search',
      })
      router.push('/dashboard/areas')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create area')
    } finally {
      setLoading(false)
    }
  }

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const query = (form.elements.namedItem('placeQuery') as HTMLInputElement)?.value?.trim()
    if (!query) {
      alert('Enter a ZIP code, county, or city')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      )
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string; boundingbox?: string[] }>
      const r = data[0]
      if (!r) throw new Error('Place not found')
      const lat = parseFloat(r.lat)
      const lng = parseFloat(r.lon)
      const geom = r.boundingbox
        ? bboxToGeoJSON([parseFloat(r.boundingbox[0]), parseFloat(r.boundingbox[1]), parseFloat(r.boundingbox[2]), parseFloat(r.boundingbox[3])])
        : undefined
      const areaType = query.match(/^\d{5}/) ? 'ZIP' : query.toLowerCase().includes('county') ? 'COUNTY' : 'CITY'
      await createArea({
        address: r.display_name,
        latitude: lat,
        longitude: lng,
        radiusMiles: 25,
        displayLabel: r.display_name,
        geometry: geom,
        type: areaType,
        source: 'search',
      })
      router.push('/dashboard/areas')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create area')
    } finally {
      setLoading(false)
    }
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let lines: string[] = []
    if (importFile) {
      const text = await importFile.text()
      lines = text
        .split(/[\r\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    } else {
      lines = importText
        .split(/[\r\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (lines.length === 0) {
      alert('Paste addresses or upload a CSV file')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/assets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, addresses: lines, radiusMiles }),
      })
      const data = await res.json()
      const created = data.created?.length ?? 0
      const failed = data.failed?.length ?? 0
      if (created > 0) {
        const msg = failed > 0 ? `${created} areas added. ${failed} failed.` : `${created} area${created > 1 ? 's' : ''} added.`
        alert(msg)
        router.push('/dashboard/areas')
      } else if (failed > 0) {
        alert(`Could not add areas. Check addresses and try again.`)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow dark:border-b dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Area</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/dashboard/areas" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium mb-6 inline-block">
          ← Back to areas
        </Link>

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-200 dark:bg-slate-700 mb-6">
          {(['address', 'zip', 'import'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {m === 'address' ? '📍 Address' : m === 'zip' ? '📮 ZIP / County' : '📋 Import'}
            </button>
          ))}
        </div>

        {/* Mode A: Address + radius */}
        {mode === 'address' && (
          <form onSubmit={handleAddressSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 space-y-4">
            {geoPromptShown && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Use your current location to suggest an area?</p>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={handleUseLocation} disabled={geoLoading} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                    {geoLoading ? 'Getting…' : 'Yes'}
                  </button>
                  <button type="button" onClick={dismissGeoPrompt} className="text-sm text-gray-600 dark:text-gray-400">
                    No thanks
                  </button>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Search address</label>
              <GeocodeSearch onSelect={handleGeocodeSelect} placeholder="Type address to search…" className="mb-1" />
              {!geoPromptShown && (
                <button type="button" onClick={handleUseLocation} disabled={geoLoading} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50">
                  {geoLoading ? 'Getting location…' : 'Use my current location'}
                </button>
              )}
              {geoError && <p className="text-xs text-red-500 mt-1">{geoError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Address</label>
              <input
                type="text"
                name="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white"
                placeholder="123 Main St, City, State ZIP"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  required
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  required
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Alert radius (miles)</label>
              <div className="flex gap-2 flex-wrap">
                {RADIUS_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadiusMiles(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      radiusMiles === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {r} mi
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0.5"
                max="100"
                step="1"
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(Number(e.target.value) || DEFAULT_RADIUS)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Creating…' : 'Add area'}
              </button>
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Mode B: ZIP / County / City - no radius required */}
        {mode === 'zip' && (
          <form onSubmit={handleZipSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">ZIP code, county, or city</label>
              <input
                type="text"
                name="placeQuery"
                required
                autoFocus
                className="w-full px-3 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white text-lg"
                placeholder="e.g. 80202, Denver County CO, Austin TX"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Looking up…' : 'Add area'}
              </button>
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Mode C: Import */}
        {mode === 'import' && (
          <form onSubmit={handleImportSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Paste addresses (one per line, or comma/semicolon separated)</label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                placeholder="123 Main St, Denver CO&#10;456 Oak Ave, Austin TX&#10;..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Or upload CSV</label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/40 dark:file:text-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Alert radius for all (miles)</label>
              <div className="flex gap-2 flex-wrap">
                {RADIUS_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadiusMiles(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      radiusMiles === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {r} mi
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Importing…' : 'Import areas'}
              </button>
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300">
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
