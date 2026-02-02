import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrgContext } from '@/lib/server-auth'
import { addDays, startOfDay, endOfDay } from 'date-fns'

/** GET ?days=7 - Upcoming follow-up tasks for the sales team */
export async function GET(request: NextRequest) {
  try {
    const { orgId } = await requireOrgContext()
    const days = Math.min(31, Math.max(1, Number(request.nextUrl.searchParams.get('days')) || 7))
    const today = startOfDay(new Date())
    const windowEnd = endOfDay(addDays(today, days))

    const assignments = await prisma.leadCadence.findMany({
      where: {
        cadence: { customerId: orgId },
        nextDueAt: { not: null, gte: today, lte: windowEnd },
      },
      include: {
        lead: { select: { id: true, name: true, company: true, email: true, phone: true } },
        cadence: {
          select: { id: true, name: true },
          include: { steps: { orderBy: [{ dayOffset: 'asc' }, { sortOrder: 'asc' }] } },
        },
      },
    })

    const byDate: Record<string, typeof assignments> = {}
    for (const a of assignments) {
      if (!a.nextDueAt) continue
      const d = startOfDay(a.nextDueAt).toISOString().slice(0, 10)
      if (!byDate[d]) byDate[d] = []
      byDate[d].push(a)
    }

    const todayStr = today.toISOString().slice(0, 10)
    const overdue = await prisma.leadCadence.findMany({
      where: {
        cadence: { customerId: orgId },
        nextDueAt: { not: null, lt: today },
        lead: { status: { notIn: ['WON', 'LOST'] } },
      },
      include: {
        lead: { select: { id: true, name: true, company: true } },
        cadence: { select: { id: true, name: true }, include: { steps: true } },
      },
    })

    return NextResponse.json({
      upcoming: assignments,
      byDate,
      overdue,
      todayCount: (byDate[todayStr] ?? []).length,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
