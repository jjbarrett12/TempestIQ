'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { hasSalesFeatures, canProposalsAndCadences } from '@/lib/plans'
import { DashboardCustomerProvider } from '@/lib/dashboard-customer-context'

const DEMO_CUSTOMER_ID = 'demo-customer-1'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [customerId, setCustomerId] = useState(DEMO_CUSTOMER_ID)
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const effectiveCustomerId = session?.user?.customerId ?? customerId

  useEffect(() => {
    const cid = session?.user?.customerId ?? DEMO_CUSTOMER_ID
    setCustomerId(cid)
    if (cid === DEMO_CUSTOMER_ID && status !== 'loading') {
      setLoading(false)
      setPlan('business')
      return
    }
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    fetch(`/api/customers/${cid}`, { signal: controller.signal })
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
  }, [session?.user?.customerId, status])

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const showSales = hasSalesFeatures(plan)
  const showProposalsAndCadences = canProposalsAndCadences(plan)

  const navLink = (href: string, label: string) => {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        onClick={() => setMobileNavOpen(false)}
        className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    )
  }

  const navLinks = (
    <>
      {navLink('/dashboard', 'Overview')}
      {navLink('/dashboard/events', 'Storms')}
      {navLink('/dashboard/reports', 'Reports')}
      {navLink('/dashboard/assets', 'Locations')}
      {navLink('/dashboard/scripts', 'Scripts')}
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
      {navLink('/marketing', 'Marketing')}
      {session && (
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/marketing' })}
          className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          Sign out
        </button>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center" onClick={() => setMobileNavOpen(false)}>
              <Image
                src="/TempestIQ logo transparent.png"
                alt="TempestIQ"
                width={280}
                height={72}
                className="h-10 w-auto object-contain sm:h-12 md:h-14"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks}
            </nav>
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-1">
            {navLinks}
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">Loading...</div>
        ) : (
          <>
            {effectiveCustomerId === DEMO_CUSTOMER_ID && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-amber-800">
                  You&apos;re viewing <strong>demo data</strong>. Sign in to see your own account and data.
                </p>
                <Link
                  href="/signin?callbackUrl=/dashboard"
                  className="shrink-0 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
            <DashboardCustomerProvider customerId={effectiveCustomerId}>
              {children}
            </DashboardCustomerProvider>
          </>
        )}
      </main>
    </div>
  )
}
