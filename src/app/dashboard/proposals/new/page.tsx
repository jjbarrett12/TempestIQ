'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

interface Lead {
  id: string
  name: string
  company: string | null
}

interface Template {
  id: string
  name: string
}

interface StormEvent {
  id: string
  type: string
  startTime: string
  severityScore: number
}

function NewProposalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = useDashboardCustomer()
  const preselectedLeadId = searchParams.get('leadId')
  const preselectedTemplateId = searchParams.get('templateId')
  const [leads, setLeads] = useState<Lead[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [storms, setStorms] = useState<StormEvent[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(preselectedTemplateId ?? '')
  const [selectedStormId, setSelectedStormId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/leads?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => setLeads(data.leads || []))
      .catch(() => {})
  }, [customerId])

  useEffect(() => {
    fetch('/api/proposal-templates')
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/storm-events?limit=20')
      .then((r) => r.json())
      .then((data) => setStorms(data.events ?? []))
      .catch(() => {})
  }, [])

  const handleMerge = async () => {
    if (!selectedTemplateId) return
    setError('')
    setMerging(true)
    try {
      const form = document.querySelector('form')
      const leadId = (form?.querySelector('[name="leadId"]') as HTMLSelectElement)?.value || null
      const res = await fetch('/api/proposal-templates/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          leadId: leadId || undefined,
          stormEventId: selectedStormId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Merge failed')
      const bodyEl = form?.querySelector('[name="body"]') as HTMLTextAreaElement
      if (bodyEl) bodyEl.value = data.merged
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setMerging(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = e.currentTarget
    const data = {
      customerId,
      leadId: (form.querySelector('[name="leadId"]') as HTMLSelectElement).value || null,
      title: (form.querySelector('[name="title"]') as HTMLInputElement).value,
      body: (form.querySelector('[name="body"]') as HTMLTextAreaElement).value,
    }
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create proposal')
      router.push(`/dashboard/proposals/${json.proposal.id}`)
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/proposals" className="text-indigo-600 hover:underline text-sm font-medium">
          ← Back to proposals
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">New proposal</h1>
      </div>

      <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Lead (optional)</label>
            <select
              name="leadId"
              defaultValue={preselectedLeadId || ''}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— None —</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name}{l.company ? ` · ${l.company}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Title *</label>
            <input
              name="title"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
              placeholder="TempestIQ — Professional plan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Content *</label>
            <textarea
              name="body"
              rows={12}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="Paste or write your proposal content (plain text or markdown)..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Saving...' : 'Create proposal'}
            </button>
            <Link href="/dashboard/proposals" className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading…</div>}>
      <NewProposalForm />
    </Suspense>
  )
}
