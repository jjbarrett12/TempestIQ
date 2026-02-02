/**
 * UX helper utilities for alerts and events.
 * DB-safe: no schema changes required for these.
 */

/** Map confidence (0-1) to label */
export function confidenceToLabel(confidence: number | null | undefined): 'High' | 'Med' | 'Low' {
  if (confidence == null || confidence < 0) return 'Low'
  if (confidence >= 0.7) return 'High'
  if (confidence >= 0.4) return 'Med'
  return 'Low'
}

/** Map severity score (0-100) to bucket */
export function severityToBucket(score: number): 'Low' | 'Medium' | 'Severe' {
  const n = score / 100
  if (n <= 0.39) return 'Low'
  if (n <= 0.74) return 'Medium'
  return 'Severe'
}

/** Severity bucket colors for badges */
export function severityBucketColor(bucket: 'Low' | 'Medium' | 'Severe'): string {
  switch (bucket) {
    case 'Low':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
    case 'Medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
    case 'Severe':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
  }
}

export type EventForGrouping = {
  id: string
  type: string
  startTime: string
  severityScore: number
  centroid?: { lat: number; lng: number }
  assetId?: string | null
}

/** Group events by (type, location key) within last X hours. Returns grouped with primary + update count. */
export function groupEvents(
  events: EventForGrouping[],
  windowHours = 24
): Array<{
  primary: EventForGrouping
  updates: number
  severityIncreased: boolean
}> {
  const now = Date.now()
  const cutoff = now - windowHours * 60 * 60 * 1000
  const recent = events.filter((e) => new Date(e.startTime).getTime() > cutoff)

  const key = (e: EventForGrouping) => {
    const loc = e.assetId ?? (e.centroid ? `${Math.round(e.centroid.lat * 10)}_${Math.round(e.centroid.lng * 10)}` : '')
    return `${e.type}|${loc}`
  }

  const byKey = new Map<string, EventForGrouping[]>()
  for (const e of recent) {
    const k = key(e)
    if (!byKey.has(k)) byKey.set(k, [])
    byKey.get(k)!.push(e)
  }

  const result: Array<{
    primary: EventForGrouping
    updates: number
    severityIncreased: boolean
  }> = []

  for (const group of byKey.values()) {
    const sorted = [...group].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
    const primary = sorted[0]
    const updates = sorted.length - 1
    const maxSev = Math.max(...group.map((e) => e.severityScore))
    const severityIncreased = updates > 0 && primary.severityScore === maxSev && group.some((e) => e.severityScore < maxSev)

    result.push({ primary, updates, severityIncreased })
  }

  result.sort((a, b) => new Date(b.primary.startTime).getTime() - new Date(a.primary.startTime).getTime())
  return result
}

/** Generate fallback ai_explanation from event metadata */
export function fallbackAiExplanation(event: {
  type: string
  severityScore?: number
  maxHailSizeIn?: number | null
  maxWindSpeedMph?: number | null
  provider?: string
}): string {
  const type = event.type === 'hail' ? 'Hail' : event.type === 'wind' ? 'Wind' : 'Storm'
  const score = event.severityScore ?? 70
  if (event.type === 'hail' && event.maxHailSizeIn != null) {
    return `${type} threat detected in your area with up to ${event.maxHailSizeIn}" hail expected. Severity score: ${score}/100.`
  }
  if (event.type === 'wind' && event.maxWindSpeedMph != null) {
    return `${type} threat with gusts up to ${event.maxWindSpeedMph} mph. Severity score: ${score}/100.`
  }
  return `${type} threat in your monitored area. Severity score: ${score}/100.`
}
