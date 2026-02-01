'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const NAV_LINKS = [
  { href: '#solutions', label: 'Built for Action' },
  { href: '#why-ai', label: 'Why AI' },
  { href: '#features', label: 'Features' },
  { href: '#safety', label: 'Safety' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
]

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b-2 border-indigo-100 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={() => setMobileOpen(false)}>
          <Image
            src="/TempestIQ%20logo%20transparent.png"
            alt="TempestIQ"
            width={1300}
            height={360}
            className="h-[62.5rem] w-auto object-contain md:h-[75rem] max-h-[80vh]"
            priority
            unoptimized
          />
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex gap-3 items-center">
          <Link
            href="/signin"
            className="hidden sm:inline-block px-4 py-2 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="#pricing"
            className="hidden sm:inline-block px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-semibold shadow-md shadow-indigo-500/30"
          >
            Get Started
          </Link>
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
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
      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-indigo-100 bg-white">
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-1 max-w-7xl">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-gray-100">
              <Link
                href="/signin"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-center"
              >
                Sign In
              </Link>
              <Link
                href="#pricing"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-center hover:from-indigo-700 hover:to-purple-700"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
