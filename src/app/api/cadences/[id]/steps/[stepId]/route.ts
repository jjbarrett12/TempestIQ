import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateStepSchema = z.object({
  dayOffset: z.number().int().min(0).optional(),
  actionType: z.string().min(1).optional(),
  subject: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id: cadenceId, stepId } = await params
    const body = await request.json()
    const data = updateStepSchema.parse(body)

    const step = await prisma.followUpCadenceStep.findFirst({
      where: { id: stepId, cadenceId },
    })
    if (!step) return NextResponse.json({ error: 'Step not found' }, { status: 404 })

    const updated = await prisma.followUpCadenceStep.update({
      where: { id: stepId },
      data: {
        ...(data.dayOffset !== undefined && { dayOffset: data.dayOffset }),
        ...(data.actionType && { actionType: data.actionType }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    })
    return NextResponse.json({ step: updated })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id: cadenceId, stepId } = await params
    const step = await prisma.followUpCadenceStep.findFirst({
      where: { id: stepId, cadenceId },
    })
    if (!step) return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    await prisma.followUpCadenceStep.delete({ where: { id: stepId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
