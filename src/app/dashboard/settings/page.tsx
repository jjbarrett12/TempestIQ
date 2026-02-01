'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'
import { useTheme } from '@/lib/theme-context'

type TeamMember = { id: string; email: string; name: string | null }

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB for data URL storage

export default function SettingsPage() {
  const customerId = useDashboardCustomer()
  const { theme, setTheme } = useTheme()
  const [company, setCompany] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetch(`/api/customers/${customerId}`, { signal: controller.signal }).then((r) => r.json()),
      fetch(`/api/customers/${customerId}/team`, { signal: controller.signal }).then((r) => r.json()),
    ])
      .then(([custRes, teamRes]) => {
        if (custRes.customer) {
          setCompany(custRes.customer.company ?? '')
          setLogoUrl(custRes.customer.logoUrl ?? '')
        }
        setTeamMembers(teamRes.teamMembers ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [customerId])

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: company.trim() || null, logoUrl: logoUrl.trim() || null }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage({ type: 'success', text: 'Company settings saved. Logo in the header will update shortly.' })
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dashboard-customer-updated'))
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return
    setAdding(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/customers/${customerId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), name: newName.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.teamMember) {
        setTeamMembers((prev) => [...prev, data.teamMember])
        setNewEmail('')
        setNewName('')
        setMessage({ type: 'success', text: 'Team member added.' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to add' })
    } finally {
      setAdding(false)
    }
  }

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file (PNG, JPEG, GIF, WebP).' })
      return
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setMessage({ type: 'error', text: 'Image must be under 2 MB. Use a smaller or compressed image.' })
      return
    }
    setMessage(null)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setLogoUrl(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this team member? They will no longer receive storm emails.')) return
    try {
      const res = await fetch(`/api/customers/${customerId}/team/${memberId}`, { method: 'DELETE' })
      if (res.ok) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== memberId))
        setMessage({ type: 'success', text: 'Team member removed.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove' })
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-gray-500 dark:text-gray-400">
        Loading settings…
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
          ← Back to overview
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Company branding, appearance, and team members who receive storm summaries by email.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Appearance */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Appearance</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose light or dark mode for the dashboard. System follows your device setting.
        </p>
        <div className="flex flex-wrap gap-3">
          {(['light', 'dark', 'system'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                theme === option
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              {option === 'light' && 'Light'}
              {option === 'dark' && 'Dark'}
              {option === 'system' && 'System'}
            </button>
          ))}
        </div>
      </section>

      {/* Company & logo */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company branding</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add a company name and logo to show in the dashboard header. Paste a logo URL or upload an image file (PNG, JPEG, GIF, WebP, max 2 MB).
        </p>
        <form onSubmit={handleSaveBranding} className="space-y-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              Company name
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400"
              placeholder="Your company name"
            />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              Logo URL or upload
            </label>
            {logoUrl && (logoUrl.startsWith('data:') || logoUrl.startsWith('http')) && (
              <div className="mb-3 flex items-center gap-3 flex-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-14 w-auto max-w-[200px] object-contain rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLogoUrl('')
                    if (logoFileInputRef.current) logoFileInputRef.current.value = ''
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove logo
                </button>
              </div>
            )}
            <input
              id="logoUrl"
              type="text"
              value={logoUrl.startsWith('data:') ? '' : logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400"
              placeholder="https://example.com/logo.png or upload below"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleLogoFile}
                className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/40 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save branding'}
          </button>
        </form>
      </section>

      {/* Team members */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team members</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add email addresses to send storm summaries when you click &quot;Email team&quot; on a storm. They will receive a summary with impact details and a link to the full storm view.
        </p>

        <form onSubmit={handleAddTeamMember} className="flex flex-wrap gap-3 mb-6">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@company.com"
            className="rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 w-48"
            required
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name (optional)"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-600 w-40"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-sm font-medium disabled:opacity-50"
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </form>

        {teamMembers.length === 0 ? (
          <p className="text-sm text-gray-500">No team members yet. Add emails above to send storm info to your team.</p>
        ) : (
          <ul className="space-y-2">
            {teamMembers.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{m.email}</span>
                  {m.name && <span className="text-sm text-gray-500 ml-2">({m.name})</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m.id)}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
