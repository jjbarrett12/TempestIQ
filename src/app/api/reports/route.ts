import { NextRequest, NextResponse } from 'next/server'
import { requireOrgContext } from '@/lib/server-auth'
import { ensureStormEvents, getStormEvent } from '@/lib/storms/mock-data'
import { createReport, listReports } from '@/lib/reports/store'
import { distanceToPolygonsMeters, isPointImpacted } from '@/lib/storms/impact'

export async function GET() {
  const { orgId } = await requireOrgContext()
  const reports = await listReports(orgId)
  return NextResponse.json({ reports })
}

export async function POST(request: NextRequest) {
  const { orgId, userId } = await requireOrgContext()
  const body = await request.json()
  let { stormEventId, address, lat, lon } = body ?? {}

  if (!stormEventId) {
    return NextResponse.json({ error: 'Missing storm event.' }, { status: 400 })
  }

  await ensureStormEvents(orgId)
  const event = await getStormEvent(orgId, stormEventId)
  if (!event) {
    return NextResponse.json({ error: 'Storm event not found.' }, { status: 404 })
  }

  // Allow quick generate without address: use storm centroid
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    lat = event.centroid.lat
    lon = event.centroid.lng
  }
  if (!address || typeof address !== 'string') {
    address = `Storm impact area (${event.type} event, ${new Date(event.startTime).toLocaleDateString()})`
  }

  const polygons = event.polygons.map((polygon) => polygon.geojson)
  const impacted = isPointImpacted({ lat, lng: lon }, polygons)
  const distanceToPolygonM = impacted ? 0 : distanceToPolygonsMeters({ lat, lng: lon }, polygons)

  const report = await createReport({
    orgId,
    stormEventId,
    address,
    lat,
    lon,
    impacted,
    distanceToPolygonM,
    createdByUserId: userId,
  })

  return NextResponse.json({
    report,
    pdfUrl: `/api/reports/${report.id}/pdf`,
  })
}
