import { NextRequest, NextResponse } from 'next/server'
import { requireOrgContext } from '@/lib/server-auth'
import { ensureStormEvents } from '@/lib/storms/mock-data'

export async function GET(request: NextRequest) {
  const { orgId } = await requireOrgContext()
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')
  const limit = Number(searchParams.get('limit') ?? 20)

  const events = await ensureStormEvents(orgId)
  const filtered = type ? events.filter((event) => event.type === type) : events

  const sorted = [...filtered].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  return NextResponse.json({ events: sorted.slice(0, limit) })
}
