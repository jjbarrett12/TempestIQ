'use client'

import { useState } from 'react'
import Link from 'next/link'

const INDUSTRIES = [
  { value: '', label: 'Select your industry' },
  { value: 'contractors-restoration', label: 'Contractors & Restoration' },
  { value: 'insurance-claims', label: 'Insurance & Claims' },
  { value: 'logistics-field-services', label: 'Logistics & Field Services' },
  { value: 'sales-revenue', label: 'Sales / Revenue Teams' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'aviation', label: 'Aviation' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'retail-qsr', label: 'Retail & QSR' },
  { value: 'events-venues', label: 'Events & Venues' },
  { value: 'other', label: 'Other' },
]

export function InquiryForm({
  title = 'Send us an inquiry',
  subtitle = "Tell us about your use case and we'll get back to you soon.",
  submitLabel = 'Send inquiry',
}: {
  title?: string
  subtitle?: string
  submitLabel?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = e.currentTarget
    const industryVal = (form.querySelector('[name="industry"]') as HTMLSelectElement).value
    const data = {
      name: (form.querySelector('[name="name"]') as HTMLInputElement).value,
      email: (form.querySelector('[name="email"]') as HTMLInputElement).value,
      company: (form.querySelector('[name="company"]') as HTMLInputElement).value || undefined,
      industry: industryVal || undefined,
      message: (form.querySelector('[name="message"]') as HTMLTextAreaElement).value,
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      let json: Record<string, unknown> = {}
      try {
        json = (await res.json()) as Record<string, unknown>
      } catch {
        // Response might not be JSON
      }
      if (!res.ok) {
        const err = json.error
        let errMsg: string
        if (Array.isArray(err) && err[0] && typeof err[0] === 'object' && err[0] !== null && 'message' in err[0]) {
          errMsg = String((err[0] as { message: unknown }).message)
        } else if (typeof err === 'string') {
          errMsg = err
        } else if (err && typeof err === 'object' && 'message' in err) {
          errMsg = String((err as { message: unknown }).message)
        } else {
          errMsg = 'Something went wrong. Please try again.'
        }
        setError(errMsg)
        setLoading(false)
        return
      }
      setSuccess(true)
      form.reset()
    } catch {
      setError('Failed to submit. Please check your connection and try again.')
    }
    setLoading(false)
  }

  return (
    <section className="bg-gray-50 rounded-2xl border-2 border-indigo-100 p-8 md:p-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{subtitle}</p>

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
          Thank you for your message. We&apos;ll get back to you soon!
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="inquiry-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Name *
            </label>
            <input
              id="inquiry-name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="inquiry-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email *
            </label>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="inquiry-company" className="block text-sm font-medium text-gray-700 mb-1.5">
              Company
            </label>
            <input
              id="inquiry-company"
              name="company"
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your company"
            />
          </div>
          <div>
            <label htmlFor="inquiry-industry" className="block text-sm font-medium text-gray-700 mb-1.5">
              Industry
            </label>
            <select
              id="inquiry-industry"
              name="industry"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {INDUSTRIES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="inquiry-message" className="block text-sm font-medium text-gray-700 mb-1.5">
            Message *
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            required
            rows={4}
            minLength={10}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Tell us about your inquiry..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : submitLabel}
          </button>
          <Link href="/" className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium">
            Back to home
          </Link>
        </div>
      </form>
    </section>
  )
}
