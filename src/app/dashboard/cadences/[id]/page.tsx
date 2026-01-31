'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const ACTION_TYPES = ['email', 'call', 'task', 'meeting']

interface Step {
  id: string
  dayOffset: number
  actionType: string
  subject: string | null
  body: string | null
  sortOrder: number
}

interface Cadence {
  id: string
  name: string
  description: string | null
  steps: Step[]
}

export default function CadenceDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [cadence, setCadence] = useState<Cadence | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingStep, setAddingStep] = useState(false)
  const [newStep, setNewStep] = useState({ dayOffset: 0, actionType: 'email', subject: '', body: '' })

  useEffect(() => {
    fetch(`/api/cadences/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCadence(data.cadence || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const addStep = async () => {
    if (!cadence) return
    setAddingStep(true)
    try {
      const res = await fetch(`/api/cadences/${id}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOffset: newStep.dayOffset,
          actionType: newStep.actionType,
          subject: newStep.subject || undefined,
          body: newStep.body || undefined,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setCadence({ ...cadence, steps: [...cadence.steps, json.step].sort((a, b) => a.dayOffset - b.dayOffset || (a as Step).sortOrder - (b as Step).sortOrder) })
        setNewStep({ dayOffset: 0, actionType: 'email', subject: '', body: '' })
      }
    } finally {
      setAddingStep(false)
    }
  }

  if (loading || !cadence) {
    return (
      <div className="py-12 text-center text-gray-500">
        {loading ? 'Loading...' : 'Cadence not found.'}
      </div>
    )
  }

  const steps = [...cadence.steps].sort((a, b) => a.dayOffset - b.dayOffset || a.sortOrder - b.sortOrder)

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/cadences" className="text-indigo-600 hover:underline text-sm font-medium">
          ← Back to cadences
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{cadence.name}</h1>
        {cadence.description && (
          <p className="text-gray-600 mt-1">{cadence.description}</p>
        )}
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Steps</h2>
          {steps.length === 0 ? (
            <p className="text-gray-500 text-sm mb-4">No steps yet. Add your first follow-up step below.</p>
          ) : (
            <ol className="space-y-4 mb-6">
              {steps.map((s, i) => (
                <li key={s.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-900">Day {s.dayOffset}</span>
                    <span className="text-gray-500 ml-2 capitalize">{s.actionType}</span>
                    {s.subject && <p className="text-sm text-gray-700 mt-1">{s.subject}</p>}
                    {s.body && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.body}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add step</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Day</label>
                <input
                  type="number"
                  min={0}
                  value={newStep.dayOffset}
                  onChange={(e) => setNewStep((prev) => ({ ...prev, dayOffset: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Action</label>
                <select
                  value={newStep.actionType}
                  onChange={(e) => setNewStep((prev) => ({ ...prev, actionType: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {ACTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Subject / note</label>
                <input
                  type="text"
                  value={newStep.subject}
                  onChange={(e) => setNewStep((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. Follow-up email"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Body / template (optional)</label>
              <textarea
                value={newStep.body}
                onChange={(e) => setNewStep((prev) => ({ ...prev, body: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Template or notes for this step"
              />
            </div>
            <button
              type="button"
              onClick={addStep}
              disabled={addingStep}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {addingStep ? 'Adding...' : 'Add step'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
