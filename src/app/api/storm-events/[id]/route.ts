import { NextResponse } from 'next/server'
import { requireOrgContext } from '@/lib/server-auth'
import { ensureStormEvents, getStormEvent } from '@/lib/storms/mock-data'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { orgId } = await requireOrgContext()
  await ensureStormEvents(orgId)
  const event = await getStormEvent(orgId, id)

  if (!event) {
    return NextResponse.json({ error: 'Storm event not found' }, { status: 404 })
  }

  return NextResponse.json({ event })
}
