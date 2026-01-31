import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCadenceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cadence = await prisma.followUpCadence.findUnique({
      where: { id },
      include: {
        steps: { orderBy: [{ dayOffset: 'asc' }, { sortOrder: 'asc' }] },
        leadAssignments: { include: { lead: { select: { id: true, name: true, company: true } } } },
      },
    })

    if (!cadence) {
      return NextResponse.json({ error: 'Cadence not found' }, { status: 404 })
    }

    return NextResponse.json({ cadence })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateCadenceSchema.parse(body)

    const cadence = await prisma.followUpCadence.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: { steps: true },
    })

    return NextResponse.json({ cadence })
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
    const { id } = await params
    await prisma.followUpCadence.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
