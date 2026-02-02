'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'
import { ProposalsListSkeleton } from '@/components/ui/Skeleton'

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
  const customerId = useDashboardCustomer()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/proposals?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setProposals(data.proposals || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [customerId])

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proposals</h1>
        <Link
          href="/dashboard/proposals/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          New proposal
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <ProposalsListSkeleton />
        ) : proposals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No proposals yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-6">Create a proposal from a lead to send scope and pricing.</p>
            <Link href="/dashboard/proposals/new" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
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
