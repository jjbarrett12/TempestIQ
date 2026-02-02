'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

export function AreaList({ customerId }: { customerId: string }) {
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

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading areas…</div>
  }

  return (
    <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/40 dark:to-indigo-900/40 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📍</span> Your Areas
        </h2>
        <Link
          href="/dashboard/areas/new"
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-sm font-medium shadow-sm"
        >
          Add area
        </Link>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {areas.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
              <svg className="w-7 h-7 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-200 font-medium">No areas yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first area to start receiving storm alerts.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/onboarding" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-sm font-medium shadow-sm">
                Quick setup wizard
              </Link>
              <Link href="/dashboard/areas/new" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-sm font-medium shadow-sm">
                Add area
              </Link>
            </div>
          </div>
        ) : (
          areas.map((area) => (
            <div key={area.id} className="p-6 hover:bg-sky-50/50 dark:hover:bg-sky-900/20 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-white">{area.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{area.displayLabel || area.address}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)} • {area.radiusMiles} mi radius
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      area.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                    }`}
                  >
                    {area.active ? 'Active' : 'Inactive'}
                  </span>
                  <Link href={`/dashboard/assets/${area.id}`} className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/40 rounded-lg font-medium">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
