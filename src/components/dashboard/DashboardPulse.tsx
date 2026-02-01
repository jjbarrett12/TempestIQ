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
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-600 rounded" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
          <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <span className="text-2xl">📍</span>
            <p className="text-xs uppercase tracking-wide font-medium text-indigo-600 dark:text-indigo-400">Locations protected</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-indigo-900 dark:text-white">{stats.totalAssets}</p>
          <p className="mt-2 text-sm text-indigo-700/80 dark:text-indigo-300/80">{stats.activeAssetsCount} active monitoring zones</p>
        </div>
        <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/30 dark:to-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <span className="text-2xl">⚠️</span>
            <p className="text-xs uppercase tracking-wide font-medium text-amber-600 dark:text-amber-400">Active threats</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-900 dark:text-white">{stats.activeThreats}</p>
          <p className="mt-2 text-sm text-amber-700/80 dark:text-amber-300/80">
            {stats.topThreatType ? `Top risk: ${stats.topThreatType}` : 'No active risk'}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/30 dark:to-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span className="text-2xl">📄</span>
            <p className="text-xs uppercase tracking-wide font-medium text-emerald-600 dark:text-emerald-400">Reports (30d)</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-white">{stats.reportsLast30}</p>
          <p className="mt-2 text-sm text-emerald-700/80 dark:text-emerald-300/80">{stats.stormsLast30} storms tracked</p>
        </div>
        <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <span className="text-2xl">🎯</span>
            <p className="text-xs uppercase tracking-wide font-medium text-purple-600 dark:text-purple-400">Readiness score</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-purple-900 dark:text-white">{stats.readiness}</p>
          <p className="mt-2 text-sm text-purple-700/80 dark:text-purple-300/80">
            {stats.latestReport ? `Last report ${formatRelativeTime(stats.latestReport)}` : 'Awaiting first report'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-900/30 dark:via-slate-800 dark:to-purple-900/30 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-medium">AI briefing</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Your storm command center is ready</h2>
              </div>
            </div>
            <Link
              href="/dashboard/scripts"
              className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
            >
              Open outreach scripts
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-gray-300">
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
              className="px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
            >
              Add a location
            </Link>
            <Link
              href="/dashboard/leads"
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-300 text-sm font-medium hover:border-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              Review lead pipeline
            </Link>
            <Link
              href="/dashboard/events"
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-300 text-sm font-medium hover:border-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              Storm verification
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400 font-medium">Value realized</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Retention drivers</h3>
            </div>
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-gray-400">
            <div>
              <div className="flex items-center justify-between">
                <span>Coverage health</span>
                <span className="font-medium text-indigo-700 dark:text-indigo-400">{stats.coverage}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${stats.coverage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>Proof velocity</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{stats.proofScore}</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.proofScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>Response readiness</span>
                <span className="font-medium text-purple-700 dark:text-purple-400">{stats.readiness}</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${stats.readiness}%` }} />
              </div>
            </div>
          </div>
          <p className="mt-5 text-xs text-slate-500 dark:text-gray-500">
            These metrics update automatically as storms and reports are processed.
          </p>
        </div>
      </div>
    </div>
  )
}
