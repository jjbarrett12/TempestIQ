'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GeocodeSearch } from '@/components/map/GeocodeSearch'
import type { GeocodeResult } from '@/lib/map/geocode'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'
import { bboxToGeoJSON } from '@/lib/map/geocode'

const STEPS = [
  { id: 1, title: 'Add your first area' },
  { id: 2, title: 'Choose alert types' },
  { id: 3, title: 'You\'re all set' },
]

const ALERT_CATEGORIES = [
  { id: 'nws', label: 'Watches & warnings', defaultOn: true },
  { id: 'hail', label: 'Hail threats & reports', defaultOn: true },
  { id: 'wind', label: 'Wind & severe storms', defaultOn: true },
]

const RADIUS_PRESETS = [10, 15, 25, 50]
const DEFAULT_RADIUS = 25

export default function OnboardingPage() {
  const router = useRouter()
  const customerId = useDashboardCustomer()
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS)
  const [displayLabel, setDisplayLabel] = useState('')
  const [geometry, setGeometry] = useState<Record<string, unknown> | null>(null)
  const [categories, setCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(ALERT_CATEGORIES.map((c) => [c.id, c.defaultOn]))
  )
  const [loading, setLoading] = useState(false)
  const [createdAssetId, setCreatedAssetId] = useState<string | null>(null)

  const handleGeocodeSelect = (r: GeocodeResult) => {
    setAddress(r.displayName)
    setDisplayLabel(r.displayName)
    setLatitude(String(r.lat))
    setLongitude(String(r.lng))
    setGeometry(r.bbox ? bboxToGeoJSON(r.bbox) : null)
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude))
        setLongitude(String(pos.coords.longitude))
        setDisplayLabel('Current location')
      },
      () => {}
    )
  }

  const handleStep2Next = async () => {
    setLoading(true)
    try {
      if (createdAssetId) {
        await fetch(`/api/assets/${createdAssetId}/alerts`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tornadoWarning: categories.nws ?? true,
            severeTstormWarning: categories.nws ?? true,
            hailThreat: categories.hail ?? true,
            extremeWind: categories.wind ?? true,
          }),
        })
      }
      for (const cat of ['nws', 'hail', 'wind'] as const) {
        await fetch(`/api/customers/${customerId}/alert-preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: cat,
            enabled: categories[cat] ?? true,
            sensitivity: 'STANDARD',
          }),
        })
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false)
      setStep(3)
    }
  }

  const handleStep1Next = async () => {
    if (!address || !latitude || !longitude) return
    setLoading(true)
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radiusMiles,
          displayLabel: displayLabel || address,
          geometry: geometry ?? undefined,
          type: 'POINT_RADIUS',
          source: 'search',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCreatedAssetId(data.asset?.id ?? null)
        setStep(2)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to add area')
      }
    } catch {
      alert('Failed to add area')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    router.push('/dashboard/events')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
            ← Skip to dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-lg">
        {/* Progress */}
        <div className="flex justify-between mb-10">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= s.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {s.id}
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Add area */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add your first area</h2>
            <p className="text-gray-600 dark:text-gray-400">Search for an address to start monitoring storm alerts.</p>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Search address</label>
              <GeocodeSearch onSelect={handleGeocodeSelect} placeholder="Type address…" />
              <button type="button" onClick={handleUseLocation} className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                Use my current location
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white"
                placeholder="123 Main St, City, State"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Latitude</label>
                <input
                  type="number"
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
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Alert radius</label>
              <div className="flex gap-2">
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
            <button
              type="button"
              onClick={handleStep1Next}
              disabled={loading || !address || !latitude || !longitude}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Adding…' : 'Continue'}
            </button>
            <Link href="/dashboard/areas/new" className="block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mt-4">
              Add city, county, ZIP, or import list instead
            </Link>
          </div>
        )}

        {/* Step 2: Alert categories */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose alert types</h2>
            <p className="text-gray-600 dark:text-gray-400">We&apos;ll notify you when these severe weather events affect your area.</p>
            <div className="space-y-3">
              {ALERT_CATEGORIES.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-slate-600 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/20"
                >
                  <input
                    type="checkbox"
                    checked={categories[c.id] ?? false}
                    onChange={(e) => setCategories((prev) => ({ ...prev, [c.id]: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">{c.label}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={handleStep2Next}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">You&apos;re all set</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We&apos;re monitoring your area for severe weather. When storms hit, you&apos;ll get alerts and can generate verification reports.
            </p>
            <button
              type="button"
              onClick={handleFinish}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
            >
              Go to Alerts
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
