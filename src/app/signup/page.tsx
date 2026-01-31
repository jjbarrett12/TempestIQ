'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { PLANS, PLAN_IDS, type PlanId } from '@/lib/plans'

function SignupForm() {
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') as PlanId | null
  const validPlan = planParam && planParam in PLANS ? planParam : PLAN_IDS.STARTER

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
    plan: validPlan,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [checkoutRedirect, setCheckoutRedirect] = useState<string | null>(null)

  useEffect(() => {
    if (planParam && planParam in PLANS) setFormData((prev) => ({ ...prev, plan: planParam }))
  }, [planParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company: formData.company || undefined,
          phone: formData.phone || undefined,
          plan: formData.plan === PLAN_IDS.ENTERPRISE ? undefined : formData.plan,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? 'Signup failed. Please try again.')
        setLoading(false)
        return
      }

      if (formData.plan === PLAN_IDS.ENTERPRISE) {
        setSubmitted(true)
        setLoading(false)
        return
      }

      const checkoutRes = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: data.customerId,
          plan: formData.plan,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/signup?plan=${formData.plan}`,
        }),
      })
      const checkoutData = await checkoutRes.json().catch(() => ({}))

      if (!checkoutRes.ok) {
        setError(checkoutData.error ?? 'Could not start checkout. You can sign in and add a plan later.')
        setSubmitted(true)
        setLoading(false)
        return
      }

      if (checkoutData.url) {
        setCheckoutRedirect(checkoutData.url)
        window.location.href = checkoutData.url
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (checkoutRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 text-center">
          <div className="animate-spin w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to secure checkout…</p>
        </div>
      </div>
    )
  }

  if (submitted && formData.plan === PLAN_IDS.ENTERPRISE) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-2xl font-bold text-white">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account created</h1>
          <p className="text-gray-600 mb-6">
            For Enterprise plans we’ll reach out to get you set up. Check your email for next steps.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (submitted && !checkoutRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-2xl font-bold text-white">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account created</h1>
          <p className="text-gray-600 mb-6">
            Complete payment in the checkout window, or sign in later to add a plan.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const selectedPlanInfo = PLANS[formData.plan as PlanId]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/90 border-b border-indigo-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/marketing" className="inline-block">
            <Image
              src="/TempestIQ logo transparent.png"
              alt="TempestIQ"
              width={140}
              height={36}
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-indigo-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-600 mb-6">
            14-day free trial. Add your card at checkout—you won’t be charged until the trial ends.
          </p>

          <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-sm font-medium text-indigo-800 mb-1">Selected plan</p>
            <p className="text-lg font-semibold text-gray-900">{selectedPlanInfo.name} — {selectedPlanInfo.priceLabel}</p>
            <Link href="/survey" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">
              Take the plan finder survey
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="jane@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Acme Roofing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value as PlanId })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={PLAN_IDS.STARTER}>Starter — $79/mo</option>
                <option value={PLAN_IDS.PROFESSIONAL}>Professional — $199/mo</option>
                <option value={PLAN_IDS.BUSINESS}>Business — $399/mo</option>
                <option value={PLAN_IDS.ENTERPRISE}>Enterprise — Custom</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50"
            >
              {loading ? 'Creating account…' : formData.plan === PLAN_IDS.ENTERPRISE ? 'Create account' : 'Create account & continue to payment'}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500 text-center">
            By signing up you agree to our Terms of Service and Privacy Policy. Payment is processed securely by Stripe.
          </p>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/dashboard" className="text-indigo-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
