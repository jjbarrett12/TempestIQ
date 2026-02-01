'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Asset = {
  id: string
  active: boolean
}

type StormEvent = {
  id: string
  type: 'hail' | 'wind'
  startTime: string
  endTime: string
  severityScore: number
}

type Report = {
  id: string
  createdAt: string
}

function formatStormType(type: StormEvent['type']) {
  return type === 'hail' ? 'Hail' : 'Wind'
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function DashboardPulse({ customerId }: { customerId: string }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [storms, setStorms] = useState<StormEvent[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 7000)

    Promise.all([
      fetch(`/api/assets?customerId=${customerId}`, { signal: controller.signal })
        .then((res) => res.ok ? res.json() : { assets: [] })
        .then((data) => data.assets ?? []),
      fetch('/api/storm-events?limit=50', { signal: controller.signal })
        .then((res) => res.ok ? res.json() : { events: [] })
        .then((data) => data.events ?? []),
      fetch('/api/reports', { signal: controller.signal })
        .then((res) => res.ok ? res.json() : { reports: [] })
        .then((data) => data.reports ?? []),
    ])
      .then(([assetData, stormData, reportData]) => {
        if (!mounted) return
        setAssets(assetData)
        setStorms(stormData)
        setReports(reportData)
      })
      .catch(() => {
        if (!mounted) return
        setAssets([])
        setStorms([])
        setReports([])
      })
      .finally(() => {
        if (!mounted) return
        clearTimeout(timeoutId)
        setLoading(false)
      })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [customerId])

  const stats = useMemo(() => {
    const totalAssets = assets.length
    const activeAssetsCount = assets.filter((asset) => asset.active).length
    const coverage = totalAssets ? Math.round((activeAssetsCount / totalAssets) * 100) : 0

    const stormsLast30 = storms.filter((storm) => {
      const created = new Date(storm.startTime).getTime()
      return created >= Date.now() - 30 * 24 * 60 * 60 * 1000
    })
    const activeThreats = storms.filter((storm) => new Date(storm.endTime).getTime() > Date.now())

    const topThreat = storms.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] ?? 0) + 1
      return acc
    }, {})

    const [topThreatType] = Object.entries(topThreat).sort((a, b) => b[1] - a[1])[0] ?? []

    const reportsLast30 = reports.filter((report) => {
      const created = new Date(report.createdAt).getTime()
      return created >= Date.now() - 30 * 24 * 60 * 60 * 1000
    })
    const proofScore = Math.min(100, reportsLast30.length * 10)

    let readiness = 40
    if (totalAssets > 0) readiness += 20
    if (coverage >= 80) readiness += 20
    if (reportsLast30.length > 0) readiness += 10
    if (activeThreats.length > 0) readiness += 10
    readiness = Math.min(100, readiness)

    return {
      totalAssets,
      activeAssetsCount,
      coverage,
      stormsLast30: stormsLast30.length,
      reportsLast30: reportsLast30.length,
      proofScore,
      activeThreats: activeThreats.length,
      topThreatType: topThreatType ? formatStormType(topThreatType as StormEvent['type']) : null,
      latestReport: reports[0]?.createdAt ?? null,
      readiness,
    }
  }, [assets, storms, reports])

  const briefingItems = useMemo(() => {
    const items: string[] = []
    if (stats.activeThreats > 0) {
      items.push(`Active threats across ${stats.activeThreats} region${stats.activeThreats === 1 ? '' : 's'}.`)
    } else if (stats.stormsLast30 > 0) {
      items.push(`No active threats right now. ${stats.stormsLast30} storm${stats.stormsLast30 === 1 ? '' : 's'} observed in the last 30 days.`)
    } else {
      items.push('No recent storm activity detected. Coverage is ready when weather spikes.')
    }

    if (stats.reportsLast30 > 0) {
      items.push(`Verification reports generated in last 30 days: ${stats.reportsLast30}.`)
    } else {
      items.push('No verification reports yet. Generate proof to win trust with homeowners and adjusters.')
    }

    if (stats.totalAssets === 0) {
      items.push('Add your first location to activate monitoring and alert routing.')
    } else {
      items.push(`Coverage health: ${stats.activeAssetsCount}/${stats.totalAssets} locations active.`)
    }

    return items
  }, [stats])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="h-40 bg-slate-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Locations protected</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.totalAssets}</p>
          <p className="mt-2 text-sm text-slate-500">{stats.activeAssetsCount} active monitoring zones</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active threats</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.activeThreats}</p>
          <p className="mt-2 text-sm text-slate-500">
            {stats.topThreatType ? `Top risk: ${stats.topThreatType}` : 'No active risk'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Reports generated (30d)</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.reportsLast30}</p>
          <p className="mt-2 text-sm text-slate-500">{stats.stormsLast30} storms tracked</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Readiness score</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.readiness}</p>
          <p className="mt-2 text-sm text-slate-500">
            {stats.latestReport ? `Last report ${formatRelativeTime(stats.latestReport)}` : 'Awaiting first report'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-500">AI briefing</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Your storm command center is ready</h2>
            </div>
            <Link
              href="/dashboard/scripts"
              className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Open outreach scripts
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {briefingItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-indigo-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/assets/new"
              className="px-4 py-2 rounded-lg border border-indigo-200 text-indigo-700 text-sm font-medium hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              Add a location
            </Link>
            <Link
              href="/dashboard/leads"
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:border-slate-300 hover:bg-white transition-colors"
            >
              Review lead pipeline
            </Link>
            <Link
              href="/dashboard/events"
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:border-slate-300 hover:bg-white transition-colors"
            >
              Storm verification
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Value realized</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Retention drivers</h3>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div>
              <div className="flex items-center justify-between">
                <span>Coverage health</span>
                <span className="font-medium text-slate-900">{stats.coverage}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${stats.coverage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>Proof velocity</span>
                <span className="font-medium text-slate-900">{stats.proofScore}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${stats.proofScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>Response readiness</span>
                <span className="font-medium text-slate-900">{stats.readiness}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${stats.readiness}%` }} />
              </div>
            </div>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            These metrics update automatically as storms and reports are processed.
          </p>
        </div>
      </div>
    </div>
  )
}
