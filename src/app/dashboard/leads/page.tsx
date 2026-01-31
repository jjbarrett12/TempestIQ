'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DEMO_CUSTOMER_ID = 'demo-customer-1'

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
  NEW: 'bg-gray-100 text-gray-800',
  CONTACTED: 'bg-blue-100 text-blue-800',
  QUALIFIED: 'bg-indigo-100 text-indigo-800',
  PROPOSAL_SENT: 'bg-amber-100 text-amber-800',
  NEGOTIATION: 'bg-purple-100 text-purple-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
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
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    const url = statusFilter
      ? `/api/leads?customerId=${DEMO_CUSTOMER_ID}&status=${statusFilter}`
      : `/api/leads?customerId=${DEMO_CUSTOMER_ID}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [statusFilter])

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500"
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
          <div className="p-8 text-center text-gray-500">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No leads yet.</p>
            <Link href="/dashboard/leads/new" className="text-indigo-600 hover:underline font-medium">
              Add your first lead
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes / Proposals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadence</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead._count.notes} notes · {lead._count.proposals} proposals
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.cadenceAssignments.length > 0
                        ? lead.cadenceAssignments.map((a) => a.cadence.name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/leads/${lead.id}`} className="text-indigo-600 hover:underline text-sm font-medium">
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
