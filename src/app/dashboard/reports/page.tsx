'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type ReportRecord = {
  id: string
  stormEventId: string
  address: string
  impacted: boolean
  distanceToPolygonM: number | null
  createdAt: string
}

function miles(meters: number | null) {
  if (meters == null) return 'N/A'
  return `${(meters / 1609.34).toFixed(1)} mi`
}

export default function ReportsLibraryPage() {
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.ok ? res.json() : { reports: [] })
      .then((data) => setReports(data.reports ?? []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return reports
    return reports.filter((report) =>
      report.address.toLowerCase().includes(query) ||
      report.stormEventId.toLowerCase().includes(query)
    )
  }, [reports, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-sm text-indigo-500 font-medium">Proof library</p>
          <h1 className="text-3xl font-bold text-gray-900">Verification reports</h1>
          <p className="text-sm text-gray-600 mt-2">
            Download reports for homeowners and adjusters, or generate new proof for a storm.
          </p>
        </div>
        <Link
          href="/dashboard/events"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Generate new report
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by address or storm ID"
          className="w-full md:w-80 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-gray-900">Generated reports</h2>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No reports yet. Generate a storm verification report to get started.
          </div>
        ) : (
          <div className="divide-y">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{report.address}</p>
                  <p className="text-xs text-gray-500 mt-1">Storm ID: {report.stormEventId}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Generated {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    report.impacted ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {report.impacted ? 'Impacted' : `Outside zone (${miles(report.distanceToPolygonM)})`}
                  </span>
                  <Link
                    href={`/api/reports/${report.id}/pdf`}
                    target="_blank"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                  >
                    Download PDF
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
