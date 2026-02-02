'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

const PLANS = [
  { id: 'starter', name: 'Starter', categories: 1, areas: 1 },
  { id: 'professional', name: 'Professional', categories: 3, areas: 10 },
  { id: 'business', name: 'Business', categories: 3, areas: 25 },
  { id: 'enterprise', name: 'Enterprise', categories: 3, areas: 999 },
]

export default function PlanSettingsPage() {
  const customerId = useDashboardCustomer()
  const [planId, setPlanId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/customers/${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        const tier = data.customer?.planTier?.toLowerCase() ?? 'business'
        setPlanId(tier)
      })
      .catch(() => setPlanId('business'))
  }, [customerId])

  const current = PLANS.find((p) => p.id === planId) ?? PLANS[2]
  const nextPlans = PLANS.filter((p) => {
    const idx = PLANS.findIndex((x) => x.id === p.id)
    const currentIdx = PLANS.findIndex((x) => x.id === planId)
    return idx > (currentIdx >= 0 ? currentIdx : 2)
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/settings" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
        ← Back to settings
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Plan</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Your current plan and upgrade options.
      </p>

      <div className="mt-6 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20">
        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Current plan</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{current.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {current.categories} alert type{current.categories > 1 ? 's' : ''} · {current.areas === 999 ? 'Unlimited' : `Up to ${current.areas}`} areas
        </p>
      </div>

      {nextPlans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upgrade options</h2>
          <div className="space-y-4">
            {nextPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.categories} alert types · {plan.areas === 999 ? 'Unlimited' : `Up to ${plan.areas}`} areas
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 text-sm font-medium cursor-not-allowed"
                >
                  Coming soon
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Payment integration coming soon.</p>
        </div>
      )}
    </div>
  )
}
