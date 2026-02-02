'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'
import { LeadsTableSkeleton } from '@/components/ui/Skeleton'

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL_SENT: 'Proposal sent',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200',
  CONTACTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  QUALIFIED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
  PROPOSAL_SENT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  NEGOTIATION: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  WON: 'bg-green-100 text-green-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
}

interface Lead {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: string
  source: string | null
  updatedAt: string
  _count: { notes: number; proposals: number }
  cadenceAssignments: { cadence: { id: string; name: string } }[]
}

export default function LeadsPage() {
  const customerId = useDashboardCustomer()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    const url = statusFilter
      ? `/api/leads?customerId=${customerId}&status=${statusFilter}`
      : `/api/leads?customerId=${customerId}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [customerId, statusFilter])

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Link
            href="/dashboard/leads/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Add lead
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <LeadsTableSkeleton />
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">No leads yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Add contacts to track and follow up with storm-affected prospects.</p>
            <Link href="/dashboard/leads/new" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
              Add your first lead
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes / Proposals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cadence</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/leads/${lead.id}`} className="font-medium text-indigo-600 hover:underline">
                        {lead.name}
                      </Link>
                      {lead.company && <p className="text-sm text-gray-500">{lead.company}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.email && <div>{lead.email}</div>}
                      {lead.phone && <div>{lead.phone}</div>}
                      {!lead.email && !lead.phone && '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[lead.status] || 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {lead._count.notes} notes · {lead._count.proposals} proposals
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {lead.cadenceAssignments.length > 0
                        ? lead.cadenceAssignments.map((a) => a.cadence.name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/leads/${lead.id}`} className="text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
