'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { InquiryForm } from '@/components/marketing/InquiryForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <section className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Contact <span className="text-indigo-600">Us</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Have questions? Want to see TempestIQ in action? Fill out the form below and we&apos;ll get back to you.
            </p>
          </section>

          <InquiryForm
            title="Get in touch"
            subtitle="Tell us about your use case, and we'll reach out within 1–2 business days."
            submitLabel="Send message"
          />
        </div>
      </main>

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
            <Link href="/about" className="hover:text-indigo-600">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
