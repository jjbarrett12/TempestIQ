'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

const TEMPLATES = [
  { id: '', name: 'Start from scratch', description: 'Build your own sequence' },
  { id: 'post-storm', name: 'Post-storm follow-up', description: 'Day 0: Initial contact, Day 3: Check-in, Day 7: Proposal' },
  { id: 'nurture', name: 'General nurture', description: 'Day 0, 3, 7, 14 touchpoints' },
  { id: 'proposal', name: 'Proposal sequence', description: 'Day 0: Send proposal, Day 2: Call, Day 5: Final follow-up' },
]

export default function NewCadencePage() {
  const router = useRouter()
  const customerId = useDashboardCustomer()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [template, setTemplate] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Enter a cadence name')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/cadences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create cadence')
      const cadenceId = json.cadence.id
      if (template === 'post-storm') {
        await Promise.all([
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 0, actionType: 'email', subject: 'Storm damage inspection follow-up' }),
          }),
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 3, actionType: 'call', subject: 'Check-in call' }),
          }),
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 7, actionType: 'meeting', subject: 'Proposal review' }),
          }),
        ])
      } else if (template === 'nurture') {
        await Promise.all([
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 0, actionType: 'email', subject: 'Initial outreach' }),
          }),
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 3, actionType: 'call', subject: 'Follow-up call' }),
          }),
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 7, actionType: 'email', subject: 'Value reminder' }),
          }),
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 14, actionType: 'task', subject: 'Final check-in' }),
          }),
        ])
      } else if (template === 'proposal') {
        await Promise.all([
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 0, actionType: 'email', subject: 'Proposal sent' }),
          }),
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 2, actionType: 'call', subject: 'Proposal follow-up call' }),
          }),
          fetch(`/api/cadences/${cadenceId}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayOffset: 5, actionType: 'email', subject: 'Final follow-up' }),
          }),
        ])
      }
      router.push(`/dashboard/cadences/${cadenceId}`)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/cadences" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          ← Back to cadences
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">New follow-up cadence</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a sequence your sales team will follow. You can add or edit steps after.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Template (optional)</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id || 'blank'} value={t.id}>
                {t.name} — {t.description}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cadence name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Post-storm follow-up"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="When to use this cadence"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-semibold shadow-lg shadow-indigo-500/25"
            >
              {loading ? 'Creating…' : 'Create cadence'}
            </button>
            <Link
              href="/dashboard/cadences"
              className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
