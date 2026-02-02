import { NextResponse } from 'next/server'
import { requireOrgContext } from '@/lib/server-auth'
import { seedStormEvents } from '@/lib/storms/mock-data'

/** POST: Add sample storm events for testing. */
export async function POST() {
  try {
    const { orgId } = await requireOrgContext()
    const events = await seedStormEvents(orgId, 8)
    return NextResponse.json({ ok: true, count: events.length })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
