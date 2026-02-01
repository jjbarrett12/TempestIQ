'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

interface Cadence {
  id: string
  name: string
  description: string | null
  steps: { id: string }[]
  _count: { leadAssignments: number }
}

export default function CadencesPage() {
  const customerId = useDashboardCustomer()
  const [cadences, setCadences] = useState<Cadence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/cadences?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setCadences(data.cadences || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [customerId])

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cadences</h1>
        <Link
          href="/dashboard/cadences/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          New cadence
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : cadences.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No cadences yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-6">Create follow-up sequences to automate outreach to leads.</p>
            <Link href="/dashboard/cadences/new" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
              Create your first cadence
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cadences.map((cadence) => (
                  <tr key={cadence.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/cadences/${cadence.id}`} className="font-medium text-indigo-600 hover:underline">
                        {cadence.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {cadence.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cadence.steps.length} steps
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cadence._count.leadAssignments} leads
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/cadences/${cadence.id}`} className="text-indigo-600 hover:underline text-sm font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
