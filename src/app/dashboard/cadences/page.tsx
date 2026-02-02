'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'
import { format, addDays, startOfDay, isToday, isTomorrow } from 'date-fns'

interface Cadence {
  id: string
  name: string
  description: string | null
  steps: { id: string; dayOffset: number; actionType: string }[]
  _count: { leadAssignments: number }
}

interface UpcomingTask {
  id: string
  nextDueAt: string | null
  lead: { id: string; name: string; company: string | null }
  cadence: { id: string; name: string; steps: { actionType: string; subject: string | null }[] }
}

export default function CadencesPage() {
  const customerId = useDashboardCustomer()
  const [cadences, setCadences] = useState<Cadence[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingTask[]>([])
  const [overdue, setOverdue] = useState<UpcomingTask[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/cadences?customerId=${customerId}`).then((r) => r.json()),
      fetch(`/api/cadences/upcoming?days=14`).then((r) => r.json()),
    ])
      .then(([cadData, upData]) => {
        setCadences(cadData.cadences || [])
        setUpcoming(upData.upcoming || [])
        setOverdue(upData.overdue || [])
        setTodayCount(upData.todayCount ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [customerId])

  const ACTION_ICONS: Record<string, string> = {
    email: '✉️',
    call: '📞',
    task: '✓',
    meeting: '📅',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Follow-up cadences</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automate outreach and never miss a follow-up. Your sales team stays on schedule.
          </p>
        </div>
        <Link
          href="/dashboard/cadences/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-semibold shadow-lg shadow-indigo-500/25"
        >
          <span>+</span> New cadence
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cadences</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{cadences.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Active sequences</p>
            </div>
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 p-5 shadow-sm">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">Today&apos;s follow-ups</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">{todayCount}</p>
              <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mt-0.5">Require action</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leads in cadences</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {cadences.reduce((s, c) => s + c._count.leadAssignments, 0)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Being nurtured</p>
            </div>
          </div>

          {(overdue.length > 0 || upcoming.length > 0) && (
            <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <span className="text-xl">🔔</span> Follow-up notifications
              </h2>
              <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-1 mb-4">
                Tasks due for your sales team. Click a lead to view details.
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {overdue.map((a) => (
                  <Link
                    key={a.id}
                    href={`/dashboard/leads/${a.lead.id}`}
                    className="block p-4 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{a.lead.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{a.lead.company || '—'}</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{a.cadence.name}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-xs font-medium">
                        Overdue
                      </span>
                    </div>
                  </Link>
                ))}
                {upcoming.slice(0, 10).map((a) => {
                  const d = a.nextDueAt ? new Date(a.nextDueAt) : null
                  const label = d ? (isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'EEE, MMM d')) : '—'
                  return (
                    <Link
                      key={a.id}
                      href={`/dashboard/leads/${a.lead.id}`}
                      className="block p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{a.lead.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{a.lead.company || '—'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{a.cadence.name}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                          {label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
              {upcoming.length > 10 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">+ {upcoming.length - 10} more in the next 14 days</p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your cadences</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Reusable sequences for email, call, and meeting follow-ups
              </p>
            </div>
            {cadences.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium">No cadences yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-md mx-auto">
                  Create follow-up sequences to automate outreach. Assign cadences to leads and your team will see due dates in one place.
                </p>
                <Link
                  href="/dashboard/cadences/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-semibold"
                >
                  Create your first cadence
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {cadences.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/cadences/${c.id}`}
                    className="block p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                        {c.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{c.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span>{c.steps.length} steps</span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span>{c._count.leadAssignments} leads</span>
                          </span>
                          <div className="flex gap-1">
                            {c.steps.slice(0, 4).map((s, i) => (
                              <span
                                key={s.id}
                                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs"
                                title={`Day ${s.dayOffset}: ${s.actionType}`}
                              >
                                {ACTION_ICONS[s.actionType] ?? '•'}
                              </span>
                            ))}
                            {c.steps.length > 4 && (
                              <span className="text-xs text-slate-400">+{c.steps.length - 4}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium sm:self-center">
                        Configure →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
