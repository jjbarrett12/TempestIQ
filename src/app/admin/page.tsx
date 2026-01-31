'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface UsageRecord {
  customerId: string
  customer: {
    name: string
    email: string
  }
  date: string
  totalTokens: number
  bySource: Record<string, number>
}

export default function AdminPage() {
  const [usage, setUsage] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/usage?days=30')
      .then(res => res.json())
      .then(data => {
        setUsage(data.usage || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch usage:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/marketing" className="inline-block">
            <Image
              src="/TempestIQ logo transparent.png"
              alt="TempestIQ"
              width={280}
              height={72}
              className="h-[72px] w-auto object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Token Usage (Last 30 Days)</h2>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : usage.length === 0 ? (
            <div className="text-gray-500">No usage data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tokens</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">By Source</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usage.map((record, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{record.customer.name}</div>
                        <div className="text-gray-500">{record.customer.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {record.totalTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {Object.entries(record.bySource).map(([source, tokens]) => (
                          <div key={source}>
                            {source}: {tokens.toLocaleString()}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
