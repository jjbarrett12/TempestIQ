'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DEMO_CUSTOMER_ID = 'demo-customer-1'

export default function NewCadencePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = e.currentTarget
    const data = {
      customerId: DEMO_CUSTOMER_ID,
      name: (form.querySelector('[name="name"]') as HTMLInputElement).value,
      description: (form.querySelector('[name="description"]') as HTMLInputElement).value || undefined,
    }
    try {
      const res = await fetch('/api/cadences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create cadence')
      router.push(`/dashboard/cadences/${json.cadence.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/cadences" className="text-indigo-600 hover:underline text-sm font-medium">
          ← Back to cadences
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">New follow-up cadence</h1>
        <p className="text-gray-600 mt-1">Create a cadence, then add steps (email, call, task) on the next page.</p>
      </div>

      <div className="max-w-xl bg-white rounded-xl shadow border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Post-event follow-up"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              name="description"
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="When to use this cadence"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Creating...' : 'Create cadence'}
            </button>
            <Link href="/dashboard/cadences" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
