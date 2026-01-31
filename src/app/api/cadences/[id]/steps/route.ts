import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createStepSchema = z.object({
  dayOffset: z.number().int().min(0),
  actionType: z.string().min(1), // "email", "call", "task", "meeting"
  subject: z.string().optional(),
  body: z.string().optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cadenceId } = await params

    const cadence = await prisma.followUpCadence.findUnique({
      where: { id: cadenceId },
      select: { id: true },
    })
    if (!cadence) {
      return NextResponse.json({ error: 'Cadence not found' }, { status: 404 })
    }

    const steps = await prisma.followUpCadenceStep.findMany({
      where: { cadenceId },
      orderBy: [{ dayOffset: 'asc' }, { sortOrder: 'asc' }],
    })
    return NextResponse.json({ steps })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cadenceId } = await params
    const body = await request.json()
    const data = createStepSchema.parse(body)

    const cadence = await prisma.followUpCadence.findUnique({
      where: { id: cadenceId },
      select: { id: true },
    })
    if (!cadence) {
      return NextResponse.json({ error: 'Cadence not found' }, { status: 404 })
    }

    const step = await prisma.followUpCadenceStep.create({
      data: {
        cadenceId,
        dayOffset: data.dayOffset,
        actionType: data.actionType,
        subject: data.subject || null,
        body: data.body || null,
        sortOrder: data.sortOrder ?? 0,
      },
    })
    return NextResponse.json({ step }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
