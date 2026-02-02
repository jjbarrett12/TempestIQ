'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

interface Area {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radiusMiles: number
  active: boolean
  displayLabel?: string | null
  type?: string
}

export default function AreasPage() {
  const customerId = useDashboardCustomer()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/assets?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setAreas(data.assets || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [customerId])

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Areas</h1>

      {/* 3 large options - no jargon */}
      <div className="grid gap-4 mb-10">
        <Link
          href="/dashboard/areas/new?mode=address"
          className="block p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left"
        >
          <span className="text-2xl block mb-2">📍</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Add an address</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enter an address and radius. Fastest option.</p>
        </Link>
        <Link
          href="/dashboard/areas/new?mode=zip"
          className="block p-5 rounded-2xl border-2 border-sky-200 dark:border-sky-700 bg-white dark:bg-slate-800 shadow-sm hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all text-left"
        >
          <span className="text-2xl block mb-2">📮</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Add a city, county, or ZIP</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Search for a region. No radius needed.</p>
        </Link>
        <Link
          href="/dashboard/areas/new?mode=import"
          className="block p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left"
        >
          <span className="text-2xl block mb-2">📋</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Import a list</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Paste addresses or upload CSV. Add many at once.</p>
        </Link>
      </div>

      {/* Areas list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your areas</h2>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400 py-8">Loading…</div>
        ) : areas.length === 0 ? (
          <div className="py-10 px-6 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">Add your first area to start receiving alerts.</p>
            <Link
              href="/dashboard/areas/new?mode=address"
              className="mt-4 inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm"
            >
              Add an address
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {areas.map((area) => (
              <li
                key={area.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{area.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {area.displayLabel || area.address} • {area.radiusMiles} mi
                  </p>
                </div>
                <Link
                  href={`/dashboard/assets/${area.id}`}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
