import { NextRequest, NextResponse } from 'next/server'
import { requireOrgContext } from '@/lib/server-auth'
import { ensureStormEvents } from '@/lib/storms/mock-data'
import { fallbackAiExplanation } from '@/lib/alerts/helpers'

export async function GET(request: NextRequest) {
  const { orgId } = await requireOrgContext()
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')
  const limit = Number(searchParams.get('limit') ?? 50)

  const events = await ensureStormEvents(orgId)
  const filtered = type ? events.filter((event) => event.type === type) : events

  const sorted = [...filtered].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  const sliced = sorted.slice(0, limit)

  const enriched = sliced.map((e) => ({
    ...e,
    ai_explanation: e.ai_explanation || fallbackAiExplanation(e),
    providers_used: [],
    confidence: e.confidence ?? (0.5 + Math.random() * 0.4),
  }))

  return NextResponse.json({
    events: enriched,
    lastCheckedAt: new Date().toISOString(),
  })
}
