'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { canProposalsAndCadences } from '@/lib/plans'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL_SENT: 'Proposal sent',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
}

interface Lead {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: string
  source: string | null
  notes: { id: string; content: string; createdAt: string }[]
  proposals: { id: string; title: string; status: string; createdAt: string }[]
  cadenceAssignments: { id: string; cadenceId: string; cadence: { id: string; name: string }; nextDueAt: string | null }[]
}

interface Cadence {
  id: string
  name: string
  description: string | null
  _count?: { leadAssignments: number }
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = useDashboardCustomer()
  const id = params.id as string
  const [lead, setLead] = useState<Lead | null>(null)
  const [cadences, setCadences] = useState<Cadence[]>([])
  const [loading, setLoading] = useState(true)
  const [noteContent, setNoteContent] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [assigningCadence, setAssigningCadence] = useState<string | null>(null)
  const showProposalsAndCadences = canProposalsAndCadences('business')

  useEffect(() => {
    Promise.all([
      fetch(`/api/leads/${id}`).then((r) => r.json()),
      showProposalsAndCadences ? fetch(`/api/cadences?customerId=${customerId}`).then((r) => r.json()) : Promise.resolve({ cadences: [] }),
    ]).then(([leadRes, cadencesRes]) => {
      setLead(leadRes.lead || null)
      setCadences(cadencesRes.cadences || [])
      setLoading(false)
    })
  }, [id, customerId, showProposalsAndCadences])

  const addNote = async () => {
    if (!noteContent.trim()) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/leads/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent.trim() }),
      })
      const json = await res.json()
      if (res.ok && lead) {
        setLead({ ...lead, notes: [{ ...json.note, createdAt: json.note.createdAt }, ...lead.notes] })
        setNoteContent('')
      }
    } finally {
      setSavingNote(false)
    }
  }

  const assignCadence = async (cadenceId: string) => {
    setAssigningCadence(cadenceId)
    try {
      const res = await fetch(`/api/leads/${id}/cadence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadenceId }),
      })
      const json = await res.json()
      if (res.ok && lead) {
        setLead({
          ...lead,
          cadenceAssignments: [
            ...lead.cadenceAssignments,
            {
              id: json.assignment.id,
              cadenceId,
              cadence: cadences.find((c) => c.id === cadenceId)!,
              nextDueAt: json.assignment.nextDueAt,
            },
          ],
        })
      }
    } finally {
      setAssigningCadence(null)
    }
  }

  const unassignCadence = async (cadenceId: string) => {
    try {
      const res = await fetch(`/api/leads/${id}/cadence?cadenceId=${cadenceId}`, { method: 'DELETE' })
      if (res.ok && lead) {
        setLead({
          ...lead,
          cadenceAssignments: lead.cadenceAssignments.filter((a) => a.cadenceId !== cadenceId),
        })
      }
    } catch {}
  }

  const updateStatus = async (status: string) => {
    if (!lead) return
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (res.ok) setLead({ ...lead, status: json.lead.status })
    } catch {}
  }

  if (loading || !lead) {
    return (
      <div className="py-12 text-center text-gray-500">
        {loading ? 'Loading...' : 'Lead not found.'}
      </div>
    )
  }

  const assignedCadenceIds = new Set(lead.cadenceAssignments.map((a) => a.cadenceId))
  const availableCadences = cadences.filter((c) => !assignedCadenceIds.has(c.id))

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/leads" className="text-indigo-600 hover:underline text-sm font-medium">
          ← Back to leads
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
            {lead.company && <p className="text-gray-600 mt-1">{lead.company}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <select
              value={lead.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
          {lead.email && <span>{lead.email}</span>}
          {lead.phone && <span>{lead.phone}</span>}
          {lead.source && <span>Source: {lead.source}</span>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="space-y-3 mb-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addNote}
                disabled={savingNote || !noteContent.trim()}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
              >
                {savingNote ? 'Saving...' : 'Add note'}
              </button>
            </div>
            <ul className="divide-y divide-gray-100">
              {lead.notes.length === 0 ? (
                <li className="py-4 text-sm text-gray-500">No notes yet.</li>
              ) : (
                lead.notes.map((note) => (
                  <li key={note.id} className="py-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                  </li>
                ))
              )}
            </ul>
          </div>

          {showProposalsAndCadences && (
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Follow-up cadences</h2>
              {lead.cadenceAssignments.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {lead.cadenceAssignments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-800">{a.cadence.name}</span>
                      <div className="flex items-center gap-2">
                        {a.nextDueAt && (
                          <span className="text-xs text-gray-500">
                            Next: {new Date(a.nextDueAt).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => unassignCadence(a.cadenceId)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {availableCadences.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableCadences.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => assignCadence(c.id)}
                      disabled={assigningCadence === c.id}
                      className="px-3 py-2 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 text-sm font-medium disabled:opacity-50"
                    >
                      {assigningCadence === c.id ? 'Adding...' : `+ ${c.name}`}
                    </button>
                  ))}
                </div>
              )}
              {cadences.length === 0 && (
                <p className="text-sm text-gray-500">
                  <Link href="/dashboard/cadences/new" className="text-indigo-600 hover:underline">Create a cadence</Link> to assign.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {showProposalsAndCadences && (
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Proposals</h2>
                <Link
                  href={`/dashboard/proposals/new?leadId=${lead.id}`}
                  className="text-sm text-indigo-600 hover:underline font-medium"
                >
                  New proposal
                </Link>
              </div>
              {lead.proposals.length === 0 ? (
                <p className="text-sm text-gray-500">No proposals yet.</p>
              ) : (
                <ul className="space-y-3">
                  {lead.proposals.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <Link href={`/dashboard/proposals/${p.id}`} className="font-medium text-indigo-600 hover:underline">
                        {p.title}
                      </Link>
                      <span className="text-xs text-gray-500">{p.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
