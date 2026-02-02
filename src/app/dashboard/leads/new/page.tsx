'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL_SENT', label: 'Proposal sent' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
]

export default function NewLeadPage() {
  const router = useRouter()
  const customerId = useDashboardCustomer()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = e.currentTarget
    const data = {
      customerId,
      name: (form.querySelector('[name="name"]') as HTMLInputElement).value,
      company: (form.querySelector('[name="company"]') as HTMLInputElement).value || undefined,
      email: (form.querySelector('[name="email"]') as HTMLInputElement).value || undefined,
      phone: (form.querySelector('[name="phone"]') as HTMLInputElement).value || undefined,
      source: (form.querySelector('[name="source"]') as HTMLInputElement).value || undefined,
    }
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to create lead')
      router.push(`/dashboard/leads/${json.lead.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/leads" className="text-indigo-600 hover:underline text-sm font-medium">
          ← Back to leads
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Add lead</h1>
      </div>

      <div className="max-w-xl bg-white rounded-xl shadow border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Name *</label>
            <input name="name" type="text" required className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500" placeholder="John Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Company</label>
            <input name="company" type="text" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500" placeholder="Acme Corp" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input name="email" type="email" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500" placeholder="john@acme.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Phone</label>
            <input name="phone" type="tel" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-indigo-500" placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Source</label>
            <input name="source" type="text" className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500" placeholder="Website, referral, event..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Saving...' : 'Create lead'}
            </button>
            <Link href="/dashboard/leads" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
