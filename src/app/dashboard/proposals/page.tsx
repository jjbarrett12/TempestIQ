'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DEMO_CUSTOMER_ID = 'demo-customer-1'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  DECLINED: 'bg-red-100 text-red-800',
}

interface Proposal {
  id: string
  title: string
  status: string
  sentAt: string | null
  createdAt: string
  lead: { id: string; name: string; company: string | null } | null
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/proposals?customerId=${DEMO_CUSTOMER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setProposals(data.proposals || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
        <Link
          href="/dashboard/proposals/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          New proposal
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No proposals yet.</p>
            <Link href="/dashboard/proposals/new" className="text-indigo-600 hover:underline font-medium">
              Create your first proposal
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {proposals.map((p) => (
              <li key={p.id} className="p-6 hover:bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Link href={`/dashboard/proposals/${p.id}`} className="font-semibold text-indigo-600 hover:underline">
                    {p.title}
                  </Link>
                  {p.lead && (
                    <p className="text-sm text-gray-600 mt-1">
                      Lead: {p.lead.name}
                      {p.lead.company && ` · ${p.lead.company}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(p.createdAt).toLocaleDateString()}
                    {p.sentAt && ` · Sent ${new Date(p.sentAt).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-800'}`}>
                  {STATUS_LABELS[p.status] || p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
