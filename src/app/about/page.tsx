'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { InquiryForm } from '@/components/marketing/InquiryForm'

export default function AboutPage() {
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

          <InquiryForm />
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
            <Link href="/contact" className="hover:text-indigo-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
