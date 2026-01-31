'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
}

interface Proposal {
  id: string
  title: string
  body: string
  status: string
  sentAt: string | null
  createdAt: string
  lead: { id: string; name: string; company: string | null } | null
}

export default function ProposalDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProposal(data.proposal || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const setStatus = async (status: string) => {
    if (!proposal) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (res.ok) setProposal({ ...proposal, ...json.proposal })
    } finally {
      setUpdating(false)
    }
  }

  if (loading || !proposal) {
    return (
      <div className="py-12 text-center text-gray-500">
        {loading ? 'Loading...' : 'Proposal not found.'}
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/proposals" className="text-indigo-600 hover:underline text-sm font-medium">
          ← Back to proposals
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
            {proposal.lead && (
              <p className="text-gray-600 mt-1">
                Lead: <Link href={`/dashboard/leads/${proposal.lead.id}`} className="text-indigo-600 hover:underline">{proposal.lead.name}</Link>
                {proposal.lead.company && ` · ${proposal.lead.company}`}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Created {new Date(proposal.createdAt).toLocaleString()}
              {proposal.sentAt && ` · Sent ${new Date(proposal.sentAt).toLocaleString()}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <select
              value={proposal.status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={updating}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Content</h2>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-mono text-sm">
          {proposal.body}
        </div>
      </div>
    </>
  )
}
