'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { InquiryForm } from '@/components/marketing/InquiryForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-purple-50/40 to-white">
      <MarketingHeader />

      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <section className="mb-12 text-center">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/TempestIQ%20logo%20transparent.png"
                alt="TempestIQ"
                width={200}
                height={56}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              We&apos;d love to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">hear from you</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Have questions? Want to see TempestIQ in action? Drop us a note—we typically respond within 1–2 business days and we&apos;re here to help.
            </p>
          </section>

          <InquiryForm
            title="Get in touch"
            subtitle="Tell us about your use case, and we'll reach out soon."
            submitLabel="Send message"
          />
        </div>
      </main>

      <footer className="bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-900 text-slate-300 py-10 px-6 mt-16 border-t border-indigo-500/20">
        <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/TempestIQ%20logo%20transparent.png"
              alt="TempestIQ"
              width={120}
              height={32}
              className="h-8 w-auto object-contain opacity-90"
            />
            <span className="text-white font-semibold">TempestIQ</span>
          </Link>
          <div className="flex gap-6 text-sm">
            <Link href="/#pricing" className="text-slate-400 hover:text-indigo-400 transition-colors">Pricing</Link>
            <Link href="/about" className="text-slate-400 hover:text-indigo-400 transition-colors">About</Link>
            <Link href="/" className="text-slate-400 hover:text-indigo-400 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
