'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Asset {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radiusMiles: number
  active: boolean
}

export function AssetList({ customerId }: { customerId: string }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/assets?customerId=${customerId}`)
      .then(res => res.json())
      .then(data => {
        setAssets(data.assets || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch assets:', err)
        setLoading(false)
      })
  }, [customerId])

  if (loading) {
    return <div className="text-gray-600">Loading assets...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Locations</h2>
        <Link
          href="/dashboard/assets/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Location
        </Link>
      </div>
      <div className="divide-y">
        {assets.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            No locations added yet. <Link href="/dashboard/assets/new" className="text-blue-600 hover:underline">Add your first location</Link>
          </div>
        ) : (
          assets.map(asset => (
            <div key={asset.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{asset.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{asset.address}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)} • {asset.radiusMiles} mile radius
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${asset.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {asset.active ? 'Active' : 'Inactive'}
                  </span>
                  <Link
                    href={`/dashboard/assets/${asset.id}`}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
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
