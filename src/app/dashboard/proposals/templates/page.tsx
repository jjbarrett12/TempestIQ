'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

const MERGE_FIELDS = [
  '[LeadName]', '[LeadCompany]', '[LeadEmail]', '[LeadPhone]',
  '[Address]', '[StormType]', '[StormDate]', '[StormArea]',
  '[YourCompany]', '[Today]',
]

type Template = { id: string; name: string; body: string; updatedAt: string }

export default function ProposalTemplatesPage() {
  const customerId = useDashboardCustomer()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste')

  useEffect(() => {
    fetch('/api/proposal-templates')
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [])

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Enter a template name')
      return
    }
    if (!body.trim()) {
      setError('Paste or upload template content')
      return
    }
    setImporting(true)
    try {
      const res = await fetch('/api/proposal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to import')
      setTemplates((prev) => [{ ...data.template, body: data.template.body }, ...prev])
      setName('')
      setBody('')
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setImporting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'txt' && ext !== 'html' && ext !== 'htm') {
      setError('Upload .txt or .html files only')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setBody(String(reader.result ?? ''))
    reader.readAsText(file)
    if (!name.trim()) setName(file.name.replace(/\.[^.]+$/, ''))
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/proposals" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          ← Back to proposals
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Merge templates</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Import proposal templates with merge fields. Use [FieldName] placeholders—they&apos;ll be replaced when you generate a proposal.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import merge document</h2>
        <form onSubmit={handleImport} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Template name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Roofing Proposal"
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="radio"
                  name="mode"
                  checked={importMode === 'paste'}
                  onChange={() => setImportMode('paste')}
                  className="rounded"
                />
                Paste content
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="radio"
                  name="mode"
                  checked={importMode === 'file'}
                  onChange={() => setImportMode('file')}
                  className="rounded"
                />
                Upload file (.txt, .html)
              </label>
            </div>
            {importMode === 'paste' ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="Paste your proposal template. Use merge fields: [LeadName], [StormType], [StormDate], [Address], [YourCompany], [Today], etc."
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white font-mono text-sm placeholder-gray-500 dark:placeholder-slate-400"
              />
            ) : (
              <input
                type="file"
                accept=".txt,.html,.htm"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
              />
            )}
            {body && importMode === 'file' && (
              <p className="text-xs text-gray-500 mt-2">Loaded {body.length} characters. Review below or clear to re-upload.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={importing || !name.trim() || !body.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {importing ? 'Importing…' : 'Import template'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 mb-8">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Merge fields</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Use these placeholders in your template. They&apos;ll be replaced when you merge with a lead and storm.
        </p>
        <div className="flex flex-wrap gap-2">
          {MERGE_FIELDS.map((f) => (
            <code key={f} className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {f}
            </code>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your templates</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-gray-500 dark:text-gray-400">
            No templates yet. Import your first merge document above.
          </div>
        ) : (
          <ul className="space-y-3">
            {templates.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex justify-between items-start"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {new Date(t.updatedAt).toLocaleDateString()} · {t.body.length} chars
                  </p>
                </div>
                <Link
                  href={`/dashboard/proposals/new?templateId=${t.id}`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Use template
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
