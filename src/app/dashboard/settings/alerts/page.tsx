'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

type Category = 'nws' | 'hail' | 'wind'
type Sensitivity = 'CRITICAL_ONLY' | 'STANDARD' | 'AGGRESSIVE'

type QuietHours = { enabled: boolean; start: number; end: number }
type AlertProfile = { quietHours?: QuietHours; urgentOverride?: boolean }

const LABELS: Record<Category, string> = {
  nws: 'Watches & warnings',
  hail: 'Hail',
  wind: 'Wind',
}

const SENS_LABELS: Record<Sensitivity, string> = {
  CRITICAL_ONLY: 'Critical only',
  STANDARD: 'Standard',
  AGGRESSIVE: 'Aggressive',
}

const DEFAULT_QUIET: QuietHours = { enabled: true, start: 21, end: 7 }

function formatHour(h: number) {
  if (h === 0) return '12:00 AM'
  if (h < 12) return `${h}:00 AM`
  if (h === 12) return '12:00 PM'
  return `${h - 12}:00 PM`
}

export default function AlertSettingsPage() {
  const router = useRouter()
  const customerId = useDashboardCustomer()
  const [prefs, setPrefs] = useState<Record<Category, { enabled: boolean; sensitivity: Sensitivity }>>({
    nws: { enabled: true, sensitivity: 'STANDARD' },
    hail: { enabled: true, sensitivity: 'STANDARD' },
    wind: { enabled: true, sensitivity: 'STANDARD' },
  })
  const [planLimit, setPlanLimit] = useState(3)
  const [alertProfile, setAlertProfile] = useState<AlertProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [testSending, setTestSending] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/customers/${customerId}/alert-preferences`).then((r) => r.json()),
      fetch(`/api/customers/${customerId}`).then((r) => r.json()),
    ])
      .then(([prefData, custData]) => {
        if (prefData.preferences) {
          const next: Record<Category, { enabled: boolean; sensitivity: Sensitivity }> = { nws: { enabled: true, sensitivity: 'STANDARD' }, hail: { enabled: true, sensitivity: 'STANDARD' }, wind: { enabled: true, sensitivity: 'STANDARD' } }
          for (const p of prefData.preferences) {
            if (['nws', 'hail', 'wind'].includes(p.category)) {
              next[p.category as Category] = {
                enabled: p.enabled ?? true,
                sensitivity: (p.sensitivity as Sensitivity) ?? 'STANDARD',
              }
            }
          }
          setPrefs(next)
        }
        setPlanLimit(prefData.planLimit ?? 3)
        const ap = (custData.customer?.alertProfile as AlertProfile) ?? null
        setAlertProfile(ap)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [customerId])

  const enabledCount = (Object.values(prefs) as { enabled: boolean }[]).filter((p) => p.enabled).length
  const atLimit = enabledCount >= planLimit
  const quietHours = alertProfile?.quietHours ?? DEFAULT_QUIET
  const urgentOverride = alertProfile?.urgentOverride ?? false

  const updatePref = async (cat: Category, patch: Partial<{ enabled: boolean; sensitivity: Sensitivity }>) => {
    const next = { ...prefs[cat], ...patch }
    if (patch.enabled === true && atLimit && !prefs[cat].enabled) return
    setSaving(cat)
    try {
      await fetch(`/api/customers/${customerId}/alert-preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: cat,
          enabled: next.enabled,
          sensitivity: next.sensitivity,
        }),
      })
      setPrefs((p) => ({ ...p, [cat]: next }))
    } finally {
      setSaving(null)
    }
  }

  const updateQuietHours = async (patch: Partial<QuietHours>) => {
    const next = { ...quietHours, ...patch }
    setSaving('quiet')
    try {
      await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertProfile: {
            ...alertProfile,
            quietHours: next,
            urgentOverride,
          },
        }),
      })
      setAlertProfile((p) => ({ ...p, quietHours: next }))
    } finally {
      setSaving(null)
    }
  }

  const updateUrgentOverride = async (val: boolean) => {
    setSaving('urgent')
    try {
      await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertProfile: {
            ...alertProfile,
            quietHours,
            urgentOverride: val,
          },
        }),
      })
      setAlertProfile((p) => ({ ...p, urgentOverride: val }))
    } finally {
      setSaving(null)
    }
  }

  const sendTestAlert = async () => {
    setTestSending(true)
    try {
      const res = await fetch('/api/alerts/send-test', { method: 'POST' })
      const data = await res.json()
      if (data.eventId) router.push(`/dashboard/events/${data.eventId}`)
      else alert(data.error || 'Failed to send test')
    } finally {
      setTestSending(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-gray-500 dark:text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/settings" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
        ← Back to settings
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Alert types</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Enable or disable alert categories. Sensitivity controls how many events you receive.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Enabled {enabledCount} of {planLimit} alert types
      </p>

      <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Quiet hours</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {formatHour(quietHours.start)} – {formatHour(quietHours.end)}
        </p>
        {urgentOverride && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⚠️ Urgent override enabled — critical alerts bypass quiet hours</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={quietHours.enabled}
              onChange={(e) => updateQuietHours({ enabled: e.target.checked })}
              disabled={!!saving}
              className="rounded border-gray-300 dark:border-slate-500 text-indigo-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable quiet hours</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={urgentOverride}
              onChange={(e) => updateUrgentOverride(e.target.checked)}
              disabled={!!saving}
              className="rounded border-gray-300 dark:border-slate-500 text-indigo-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Urgent override (critical alerts always)</span>
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={sendTestAlert}
          disabled={testSending}
          className="px-4 py-2 rounded-lg border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm font-medium disabled:opacity-50"
        >
          {testSending ? 'Creating…' : 'Send test alert'}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Creates a demo hail event and opens it. No real storm.</p>
      </div>

      <div className="mt-8 space-y-4">
        {(['nws', 'hail', 'wind'] as const).map((cat) => (
          <div
            key={cat}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">{LABELS[cat]}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs[cat].enabled}
                  onChange={(e) => {
                    const on = e.target.checked
                    if (on && atLimit) return
                    updatePref(cat, { enabled: on })
                  }}
                  disabled={!prefs[cat].enabled && atLimit}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
            {prefs[cat].enabled && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sensitivity</label>
                <select
                  value={prefs[cat].sensitivity}
                  onChange={(e) => updatePref(cat, { sensitivity: e.target.value as Sensitivity })}
                  disabled={!!saving}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                >
                  {(['CRITICAL_ONLY', 'STANDARD', 'AGGRESSIVE'] as const).map((s) => (
                    <option key={s} value={s}>
                      {SENS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
        {atLimit && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4 flex-wrap">
            <span className="text-sm text-amber-800 dark:text-amber-200">🔒 Upgrade to unlock more alert types</span>
            <Link href="/dashboard/settings/plan" className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
              Upgrade
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
