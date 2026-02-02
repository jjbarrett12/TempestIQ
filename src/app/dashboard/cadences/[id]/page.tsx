'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'

const DAY_OPTIONS = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30]
const ACTION_TYPES = [
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'call', label: 'Call', icon: '📞' },
  { value: 'task', label: 'Task', icon: '✓' },
  { value: 'meeting', label: 'Meeting', icon: '📅' },
]

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
  leadAssignments: {
    id: string
    nextDueAt: string | null
    lead: { id: string; name: string; company: string | null }
  }[]
}

export default function CadenceDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [cadence, setCadence] = useState<Cadence | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingStep, setAddingStep] = useState(false)
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [newStep, setNewStep] = useState({ dayOffset: 0, actionType: 'email', subject: '', body: '' })
  const [calendarMonth, setCalendarMonth] = useState(new Date())

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
        setCadence({
          ...cadence,
          steps: [...cadence.steps, json.step].sort((a, b) => a.dayOffset - b.dayOffset || a.sortOrder - b.sortOrder),
        })
        setNewStep({ dayOffset: 0, actionType: 'email', subject: '', body: '' })
      }
    } finally {
      setAddingStep(false)
    }
  }

  const updateStep = async (stepId: string, updates: Partial<Step>) => {
    if (!cadence) return
    const res = await fetch(`/api/cadences/${id}/steps/${stepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const json = await res.json()
      setCadence({
        ...cadence,
        steps: cadence.steps.map((s) => (s.id === stepId ? json.step : s)).sort((a, b) => a.dayOffset - b.dayOffset || a.sortOrder - b.sortOrder),
      })
      setEditingStepId(null)
    }
  }

  const deleteStep = async (stepId: string) => {
    if (!cadence || !confirm('Remove this step?')) return
    const res = await fetch(`/api/cadences/${id}/steps/${stepId}`, { method: 'DELETE' })
    if (res.ok) {
      setCadence({ ...cadence, steps: cadence.steps.filter((s) => s.id !== stepId) })
      setEditingStepId(null)
    }
  }

  if (loading || !cadence) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        {loading ? 'Loading…' : 'Cadence not found.'}
      </div>
    )
  }

  const steps = [...cadence.steps].sort((a, b) => a.dayOffset - b.dayOffset || a.sortOrder - b.sortOrder)
  const dueDates = cadence.leadAssignments
    .filter((a) => a.nextDueAt)
    .map((a) => new Date(a.nextDueAt!).toISOString().slice(0, 10))
  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const blankStart = monthStart.getDay()

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <Link href="/dashboard/cadences" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            ← Back to cadences
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{cadence.name}</h1>
          {cadence.description && (
            <p className="text-slate-600 dark:text-slate-400 mt-1">{cadence.description}</p>
          )}
        </div>
        <Link
          href={`/dashboard/leads`}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Assign to leads →
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Sequence steps</h2>
            {steps.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">No steps yet. Add your first follow-up step below.</p>
            ) : (
              <ol className="space-y-3 mb-6">
                {steps.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      {editingStepId === s.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Day</label>
                              <select
                                value={s.dayOffset}
                                onChange={(e) => updateStep(s.id, { dayOffset: Number(e.target.value) })}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
                              >
                                {DAY_OPTIONS.map((d) => (
                                  <option key={d} value={d}>Day {d}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Action</label>
                              <select
                                value={s.actionType}
                                onChange={(e) => updateStep(s.id, { actionType: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
                              >
                                {ACTION_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <input
                            type="text"
                            defaultValue={s.subject ?? ''}
                            onBlur={(e) => {
                              updateStep(s.id, { subject: e.target.value.trim() || null })
                              setEditingStepId(null)
                            }}
                            placeholder="Subject / note"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => deleteStep(s.id)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Remove step
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStepId(null)}
                              className="text-sm text-slate-500 hover:underline"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">Day {s.dayOffset}</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {ACTION_TYPES.find((t) => t.value === s.actionType)?.icon} {s.actionType}
                            </span>
                          </div>
                          {s.subject && <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{s.subject}</p>}
                          {s.body && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{s.body}</p>}
                          <button
                            type="button"
                            onClick={() => setEditingStepId(s.id)}
                            className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Add step</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Day</label>
                  <select
                    value={newStep.dayOffset}
                    onChange={(e) => setNewStep((p) => ({ ...p, dayOffset: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2.5 text-slate-900 dark:text-white"
                  >
                    {DAY_OPTIONS.map((d) => (
                      <option key={d} value={d}>Day {d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Action type</label>
                  <select
                    value={newStep.actionType}
                    onChange={(e) => setNewStep((p) => ({ ...p, actionType: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2.5 text-slate-900 dark:text-white"
                  >
                    {ACTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Subject / note</label>
                  <input
                    type="text"
                    value={newStep.subject}
                    onChange={(e) => setNewStep((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Follow-up email"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Body / template (optional)</label>
                <textarea
                  value={newStep.body}
                  onChange={(e) => setNewStep((p) => ({ ...p, body: e.target.value }))}
                  rows={2}
                  placeholder="Template or notes for this step"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                />
              </div>
              <button
                type="button"
                onClick={addStep}
                disabled={addingStep}
                className="mt-4 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
              >
                {addingStep ? 'Adding…' : 'Add step'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Follow-up calendar</h3>
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCalendarMonth((m) => addDays(m, -30))}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
              >
                ←
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {format(calendarMonth, 'MMMM yyyy')}
              </span>
              <button
                type="button"
                onClick={() => setCalendarMonth((m) => addDays(m, 30))}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-center text-slate-500 dark:text-slate-400 py-1">{d}</div>
              ))}
              {Array.from({ length: blankStart }).map((_, i) => (
                <div key={`b-${i}`} className="h-8" />
              ))}
              {days.map((d) => {
                const dateStr = format(d, 'yyyy-MM-dd')
                const hasDue = dueDates.includes(dateStr)
                return (
                  <div
                    key={dateStr}
                    className={`h-8 flex items-center justify-center rounded text-xs ${
                      isSameMonth(d, calendarMonth)
                        ? isToday(d)
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-semibold'
                          : hasDue
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                            : 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  >
                    {format(d, 'd')}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Highlighted dates have follow-ups due for leads in this cadence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Assigned leads</h3>
            {cadence.leadAssignments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No leads assigned yet.</p>
            ) : (
              <ul className="space-y-2">
                {cadence.leadAssignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <Link href={`/dashboard/leads/${a.lead.id}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
                      {a.lead.name}
                    </Link>
                    {a.nextDueAt && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(a.nextDueAt), 'MMM d')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/dashboard/leads"
              className="mt-3 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Assign more leads →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
