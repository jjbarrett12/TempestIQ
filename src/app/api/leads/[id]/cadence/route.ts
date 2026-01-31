import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const assignSchema = z.object({ cadenceId: z.string().min(1) })

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params
    const body = await request.json()
    const { cadenceId } = assignSchema.parse(body)

    const [lead, cadence] = await Promise.all([
      prisma.lead.findUnique({ where: { id: leadId }, select: { customerId: true } }),
      prisma.followUpCadence.findUnique({ where: { id: cadenceId }, include: { steps: true } }),
    ])

    if (!lead || !cadence || lead.customerId !== cadence.customerId) {
      return NextResponse.json({ error: 'Lead or cadence not found' }, { status: 404 })
    }

    const steps = cadence.steps.sort((a, b) => a.dayOffset - b.dayOffset)
    const firstStep = steps[0]
    const nextDueAt = firstStep
      ? (() => {
          const d = new Date()
          d.setDate(d.getDate() + firstStep.dayOffset)
          return d
        })()
      : null

    const assignment = await prisma.leadCadence.upsert({
      where: {
        leadId_cadenceId: { leadId, cadenceId },
      },
      create: {
        leadId,
        cadenceId,
        nextDueAt,
        currentStepIndex: 0,
      },
      update: {
        startedAt: new Date(),
        nextDueAt,
        currentStepIndex: 0,
      },
      include: {
        cadence: { include: { steps: { orderBy: { dayOffset: 'asc' } } } },
      },
    })

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params
    const cadenceId = _request.nextUrl.searchParams.get('cadenceId')
    if (!cadenceId) {
      return NextResponse.json({ error: 'cadenceId required' }, { status: 400 })
    }

    await prisma.leadCadence.delete({
      where: { leadId_cadenceId: { leadId, cadenceId } },
    })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
