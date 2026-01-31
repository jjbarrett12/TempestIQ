'use client'

import { useState } from 'react'
import Link from 'next/link'

const SCRIPTS = {
  sms: {
    title: 'SMS (text)',
    placeholder: '[Address] = property address, [StormType] = e.g. Hail / High Wind',
    templates: [
      `Hi [Name], [StormType] was reported at [Address] on [Date]. We offer free inspections for storm damage. Reply YES for a callback.`,
      `[Address]: [StormType] event [Date]. First to inspect often wins the job. Free assessment—reply or call us.`,
      `Storm damage inspection available for [Address] ([StormType], [Date]). No obligation. Reply YES to schedule.`,
    ],
  },
  email: {
    title: 'Email',
    placeholder: '[Address], [StormType], [Date], [YourCompany]',
    templates: [
      `Subject: Storm damage inspection – [Address]\n\nHi [Name],\n\n[StormType] was documented at [Address] on [Date]. We offer free, no-obligation inspections for roofing [and/or siding, gutters]. Our team can provide a time-stamped storm report to support insurance claims.\n\nReply to schedule a visit.\n\n[YourCompany]`,
      `Subject: [Address] – storm event [Date]\n\nHi [Name],\n\nWe have a verified [StormType] event for [Address] on [Date]. First contractor on site often wins the job—and we’re happy to provide storm verification for your claim.\n\n[YourCompany]`,
    ],
  },
  doorHanger: {
    title: 'Door hanger copy',
    placeholder: '[Address], [StormType], [Date], [Phone]',
    templates: [
      `STORM EVENT AT [Address]\n[StormType] – [Date]\nFree damage inspection. No obligation.\n[Phone] | [YourCompany]`,
      `Your area was impacted by [StormType] on [Date].\nFree roof/siding inspection.\nCall or text: [Phone]\n[YourCompany]`,
      `[StormType] reported here [Date].\nWe offer free storm damage assessments.\n[Phone]`,
    ],
  },
}

export default function ScriptsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          ← Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Outreach scripts</h1>
        <p className="text-gray-600 mt-1">
          Copy-paste templates for SMS, email, and door hangers. Replace placeholders with the lead’s address, storm type, and date.
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(SCRIPTS).map(([key, { title, placeholder, templates }]) => (
          <section key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{placeholder}</p>
            </div>
            <ul className="divide-y divide-gray-100">
              {templates.map((text, i) => (
                <li key={i} className="px-6 py-4 flex items-start justify-between gap-4">
                  <pre className="flex-1 text-sm text-gray-700 whitespace-pre-wrap font-sans overflow-x-auto">
                    {text}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(text, `${key}-${i}`)}
                    className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                  >
                    {copied === `${key}-${i}` ? 'Copied' : 'Copy'}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
