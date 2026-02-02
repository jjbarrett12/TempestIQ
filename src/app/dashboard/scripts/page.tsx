'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

type StormEvent = {
  id: string
  type: 'hail' | 'wind'
  startTime: string
  severityScore: number
}

type StormContext = {
  stormType: string
  date: string
  areaName: string
  areaDescription: string
  neighborhoods: string[]
}

const EMAIL_TEMPLATES = [
  {
    subject: 'Storm damage inspection – [Address]',
    body: `Hi [Name],

[StormType] was documented at [Address] on [Date]. We offer free, no-obligation inspections for roofing, siding, and gutters. Our team can provide a time-stamped storm report to support insurance claims.

Reply to schedule a visit.

[YourCompany]`,
  },
  {
    subject: '[Address] – storm event [Date]',
    body: `Hi [Name],

We have a verified [StormType] event for [Address] on [Date]. First contractor on site often wins the job—and we're happy to provide storm verification for your claim.

[YourCompany]`,
  },
]

function fillTemplate(
  template: { subject: string; body: string },
  ctx: StormContext,
  overrides: { address?: string; name?: string; company?: string }
) {
  const addr = overrides.address || ctx.areaDescription
  const name = overrides.name || 'there'
  const company = overrides.company || 'Your Company'
  return {
    subject: template.subject
      .replace('[Address]', addr)
      .replace('[Date]', ctx.date),
    body: template.body
      .replace(/\[StormType\]/g, ctx.stormType)
      .replace(/\[Address\]/g, addr)
      .replace(/\[Date\]/g, ctx.date)
      .replace(/\[Name\]/g, name)
      .replace(/\[YourCompany\]/g, company),
  }
}

function mailtoLink(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function ScriptsPage() {
  const customerId = useDashboardCustomer()
  const [storms, setStorms] = useState<StormEvent[]>([])
  const [selectedStormId, setSelectedStormId] = useState<string | null>(null)
  const [context, setContext] = useState<StormContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingContext, setLoadingContext] = useState(false)
  const [addressOverride, setAddressOverride] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (customerId && customerId !== 'demo-customer-1') {
      fetch(`/api/customers/${customerId}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.customer?.company) setCompanyName(data.customer.company)
          else if (data?.customer?.name) setCompanyName(data.customer.name)
        })
        .catch(() => {})
    }
  }, [customerId])

  useEffect(() => {
    fetch('/api/storm-events?limit=20')
      .then((r) => r.ok ? r.json() : { events: [] })
      .then((data) => {
        const events = data.events ?? []
        setStorms(events)
        if (events.length > 0 && !selectedStormId) {
          setSelectedStormId(events[0].id)
        }
      })
      .catch(() => setStorms([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedStormId) {
      setContext(null)
      return
    }
    setLoadingContext(true)
    fetch(`/api/scripts/storm-context?stormId=${selectedStormId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setContext({
            stormType: data.stormType,
            date: data.date,
            areaName: data.areaName,
            areaDescription: data.areaDescription,
            neighborhoods: data.neighborhoods ?? [],
          })
        } else {
          setContext(null)
        }
      })
      .catch(() => setContext(null))
      .finally(() => setLoadingContext(false))
  }, [selectedStormId])

  const ctx = context
  const overrides = {
    address: addressOverride.trim() || undefined,
    name: recipientName.trim() || undefined,
    company: companyName.trim() || undefined,
  }

  const openDoorHanger = () => {
    if (!selectedStormId || !ctx) return
    const q = new URLSearchParams({
      stormId: selectedStormId,
      company: companyName.trim() || 'Your Company',
      phone: phone.trim() || '(555) 123-4567',
    })
    if (addressOverride.trim()) q.set('address', addressOverride.trim())
    window.open(`/dashboard/scripts/door-hanger?${q.toString()}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          ← Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Outreach scripts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate email scripts with storm details auto-filled. Open in your email client to send.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select storm</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading storms…</p>
        ) : storms.length === 0 ? (
          <p className="text-sm text-gray-500">
            No storms yet.{' '}
            <Link href="/dashboard/events" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Load sample storms
            </Link>
          </p>
        ) : (
          <select
            value={selectedStormId ?? ''}
            onChange={(e) => setSelectedStormId(e.target.value || null)}
            className="w-full max-w-md rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            {storms.map((s) => (
              <option key={s.id} value={s.id}>
                {s.type.toUpperCase()} · {new Date(s.startTime).toLocaleDateString()} · Severity {s.severityScore}
              </option>
            ))}
          </select>
        )}
      </div>

      {ctx && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-indigo-50/50 dark:bg-indigo-900/20 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Storm context</h2>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            <strong>{ctx.stormType}</strong> · {ctx.date} · {ctx.areaDescription}
          </p>
          {ctx.neighborhoods.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Areas: {ctx.neighborhoods.join(', ')}
            </p>
          )}
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address override</label>
              <input
                type="text"
                value={addressOverride}
                onChange={(e) => setAddressOverride(e.target.value)}
                placeholder={ctx.areaDescription}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Recipient name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Prospect"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Your company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone (door hanger)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      )}

      {loadingContext ? (
        <div className="text-sm text-gray-500 py-8">Loading storm details…</div>
      ) : ctx ? (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email templates</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Storm info and areas auto-populated. Click &quot;Open in email&quot; to send.
            </p>
          </div>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {EMAIL_TEMPLATES.map((template, i) => {
              const filled = fillTemplate(template, ctx, overrides)
              const link = mailtoLink(filled.subject, filled.body)
              return (
                <li key={i} className="px-6 py-4">
                  <div className="flex flex-col gap-3">
                    <pre className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap font-sans overflow-x-auto bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                      {filled.subject}

{filled.body}
                    </pre>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={link}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                      >
                        Open in email
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${filled.subject}\n\n${filled.body}`)
                        }}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        !loading && storms.length > 0 && (
          <div className="text-sm text-gray-500 py-8">Select a storm to generate scripts.</div>
        )
      )}

      {ctx && (
        <section className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Door hanger</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Print-ready color marketing door hanger with storm details. Opens in a new tab.
            </p>
          </div>
          <div className="px-6 py-4 flex flex-wrap gap-4 items-center">
            <button
              type="button"
              onClick={openDoorHanger}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-amber-900 text-sm font-medium hover:bg-amber-400"
            >
              Generate door hanger
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Storm: {ctx.stormType} · {ctx.date} · {overrides.address || ctx.areaDescription}
            </span>
          </div>
        </section>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">SMS templates</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Copy and adapt for text campaigns.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>SMS:</strong> Hi [Name], [StormType] was reported at [Address] on [Date]. We offer free inspections. Reply YES for a callback.
        </p>
      </div>
    </div>
  )
}
