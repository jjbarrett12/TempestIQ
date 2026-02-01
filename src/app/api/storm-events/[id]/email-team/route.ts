import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ensureStormEvents, getStormEvent } from '@/lib/storms/mock-data'
import { formatStormSummaryEmail, sendEmail } from '@/services/notifications/email'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const customerId = (session?.user as { customerId?: string } | undefined)?.customerId
    if (!customerId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }

    const { id: eventId } = await params
    await ensureStormEvents(customerId)
    const event = await getStormEvent(customerId, eventId)
    if (!event) {
      return NextResponse.json({ error: 'Storm event not found' }, { status: 404 })
    }

    const members = await prisma.teamMember.findMany({
      where: { customerId },
    })
    if (members.length === 0) {
      return NextResponse.json(
        { error: 'Add team members in Settings before sending storm info.' },
        { status: 400 }
      )
    }

    const { subject, html } = formatStormSummaryEmail({
      id: event.id,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      severityScore: event.severityScore,
      maxHailSizeIn: event.maxHailSizeIn,
      maxWindSpeedMph: event.maxWindSpeedMph,
      impactedAreaCount: event.impactedAreaCount,
      polygons: event.polygons,
    })

    let sent = 0
    for (const member of members) {
      const result = await sendEmail({ to: member.email, subject, html })
      if (result.success) sent++
    }

    return NextResponse.json({
      ok: true,
      sent,
      total: members.length,
      message: `Storm summary sent to ${sent} of ${members.length} team member(s).`,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to send emails' },
      { status: 500 }
    )
  }
}
