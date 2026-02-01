'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'

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

export default function AboutPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = e.currentTarget
    const data = {
      name: (form.querySelector('[name="name"]') as HTMLInputElement).value,
      email: (form.querySelector('[name="email"]') as HTMLInputElement).value,
      company: (form.querySelector('[name="company"]') as HTMLInputElement).value || undefined,
      industry: (form.querySelector('[name="industry"]') as HTMLSelectElement).value || undefined,
      message: (form.querySelector('[name="message"]') as HTMLTextAreaElement).value,
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMsg = (Array.isArray(json.error) ? json.error[0]?.message : json.error?.message ?? json.error)
        setError(typeof errMsg === 'string' ? errMsg : 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      setSuccess(true)
      form.reset()
    } catch {
      setError('Failed to submit. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* About section */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              About <span className="text-indigo-600">TempestIQ</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              TempestIQ turns severe weather into actionable revenue intelligence. We help teams across industries—
              from contractors and restoration companies to insurance, logistics, and sales—act faster when storms hit.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our AI-powered platform combines real-time alerts, impact scoring, and verification proof so you can
              deploy crews, prioritize inspections, and reach customers when demand spikes. We sell clarity and action,
              not data feeds.
            </p>
          </section>

          {/* Inquiry form */}
          <section className="bg-gray-50 rounded-2xl border-2 border-indigo-100 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us an inquiry</h2>
            <p className="text-gray-600 mb-6">
              Tell us about your use case and we&apos;ll get back to you soon.
            </p>

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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email *
                  </label>
                  <input
                    id="email"
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
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Industry
                  </label>
                  <select
                    id="industry"
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
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  id="message"
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
                  {loading ? 'Sending...' : 'Send inquiry'}
                </button>
                <Link
                  href="/"
                  className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Back to home
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-6 mt-16">
        <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/TempestIQ logo transparent.png"
              alt="TempestIQ"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/#pricing" className="hover:text-indigo-600">Pricing</Link>
            <Link href="/#contact" className="hover:text-indigo-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
