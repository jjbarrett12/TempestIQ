import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCadenceSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    const cadences = await prisma.followUpCadence.findMany({
      where: { customerId },
      include: {
        steps: { orderBy: [{ dayOffset: 'asc' }, { sortOrder: 'asc' }] },
        _count: { select: { leadAssignments: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ cadences })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createCadenceSchema.parse(body)

    const cadence = await prisma.followUpCadence.create({
      data: {
        customerId: data.customerId,
        name: data.name,
        description: data.description || null,
      },
      include: { steps: true },
    })

    return NextResponse.json({ cadence }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
