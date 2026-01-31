'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { hasSalesFeatures, canProposalsAndCadences } from '@/lib/plans'

const DEMO_CUSTOMER_ID = 'demo-customer-1'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [customerId, setCustomerId] = useState(DEMO_CUSTOMER_ID)
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s so site doesn't hang
    fetch(`/api/customers/${DEMO_CUSTOMER_ID}`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.customer) {
          setCustomerId(data.customer.id)
          setPlan(data.customer.plan ?? 'business')
        } else {
          setPlan('business')
        }
      })
      .catch(() => setPlan('business'))
      .finally(() => {
        clearTimeout(timeoutId)
        setLoading(false)
      })
  }, [])

  const showSales = hasSalesFeatures(plan)
  const showProposalsAndCadences = canProposalsAndCadences(plan)

  const navLink = (href: string, label: string) => {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/TempestIQ logo transparent.png"
                alt="TempestIQ"
                width={140}
                height={36}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <nav className="flex items-center gap-1">
              {navLink('/dashboard', 'Overview')}
              {navLink('/dashboard/assets', 'Locations')}
              {showSales && (
                <>
                  {navLink('/dashboard/leads', 'Leads')}
                  {showProposalsAndCadences && (
                    <>
                      {navLink('/dashboard/proposals', 'Proposals')}
                      {navLink('/dashboard/cadences', 'Cadences')}
                    </>
                  )}
                </>
              )}
              <Link
                href="/marketing"
                className="ml-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Marketing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">Loading...</div>
        ) : (
          children
        )}
      </main>
    </div>
  )
}
