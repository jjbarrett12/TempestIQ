'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GeocodeSearch } from '@/components/map/GeocodeSearch'
import type { GeocodeResult } from '@/lib/map/geocode'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

export default function NewAssetPage() {
  const router = useRouter()
  const customerId = useDashboardCustomer()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const handleGeocodeSelect = (r: GeocodeResult) => {
    setAddress(r.displayName)
    setLatitude(String(r.lat))
    setLongitude(String(r.lng))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      customerId,
      name: formData.get('name'),
      address: formData.get('address') || address,
      latitude: parseFloat((formData.get('latitude') as string) || latitude),
      longitude: parseFloat((formData.get('longitude') as string) || longitude),
      radiusMiles: parseFloat(formData.get('radiusMiles') as string) || 5,
      timezone: formData.get('timezone') || 'America/New_York',
    }

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (err) {
      alert('Failed to create asset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Add New Location</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard/assets" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to locations
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Location Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-600"
              placeholder="e.g., Main Office"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Search address (fills coordinates)
            </label>
            <GeocodeSearch onSelect={handleGeocodeSelect} placeholder="Type address to search…" className="mb-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-600"
              placeholder="123 Main St, City, State ZIP"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
<label className="block text-sm font-medium text-gray-800 mb-1">
              Latitude
              </label>
              <input
                type="number"
                name="latitude"
                required
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-600"
                placeholder="40.7128"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                required
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-600"
                placeholder="-74.0060"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Radius (miles)
            </label>
            <input
              type="number"
              name="radiusMiles"
              min="0.5"
              max="50"
              step="0.5"
              defaultValue="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Timezone
            </label>
            <select
              name="timezone"
              defaultValue="America/New_York"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Location'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
