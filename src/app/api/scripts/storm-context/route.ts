import { NextRequest, NextResponse } from 'next/server'
import { requireOrgContext } from '@/lib/server-auth'
import { ensureStormEvents, getStormEvent } from '@/lib/storms/mock-data'
import { reverseGeocode } from '@/lib/map/geocode'

/**
 * GET ?stormId=xxx
 * Returns storm details + reverse-geocoded area for script generation.
 */
export async function GET(request: NextRequest) {
  try {
    const { orgId } = await requireOrgContext()
    const stormId = request.nextUrl.searchParams.get('stormId')
    if (!stormId) {
      return NextResponse.json({ error: 'stormId required' }, { status: 400 })
    }

    await ensureStormEvents(orgId)
    const event = await getStormEvent(orgId, stormId)
    if (!event) {
      return NextResponse.json({ error: 'Storm not found' }, { status: 404 })
    }

    const areaName = await reverseGeocode(event.centroid.lat, event.centroid.lng)
    const neighborhoods = Array.from(
      new Set(event.polygons.flatMap((p) => p.impactedNeighborhoods || []))
    ).slice(0, 8)
    const areaDescription = neighborhoods.length > 0
      ? `${areaName || 'Impact zone'} (${neighborhoods.join(', ')})`
      : areaName || `${event.centroid.lat.toFixed(2)}, ${event.centroid.lng.toFixed(2)}`

    return NextResponse.json({
      stormType: event.type === 'hail' ? 'Hail' : 'High Wind',
      date: new Date(event.startTime).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      areaName: areaName || 'Storm impact area',
      areaDescription,
      neighborhoods,
      severityScore: event.severityScore,
      maxHailSizeIn: event.maxHailSizeIn,
      maxWindSpeedMph: event.maxWindSpeedMph,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
