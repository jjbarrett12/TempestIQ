import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createTestStormEvent } from '@/lib/storms/mock-data'
import { DEFAULT_ORG_ID } from '@/lib/storms/mock-data'

/**
 * Insert a mock test event for the signed-in user. No provider APIs called.
 * Returns event id for redirect to /events/[id].
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const orgId = (session?.user as { customerId?: string })?.customerId ?? DEFAULT_ORG_ID

    const event = await createTestStormEvent(orgId)
    return NextResponse.json({ eventId: event.id })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
