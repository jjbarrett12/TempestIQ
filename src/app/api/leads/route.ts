import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LeadStatus, Prisma } from '@prisma/client'
import { z } from 'zod'

const createLeadSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  source: z.string().optional(),
  assetId: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customerId')
    const status = request.nextUrl.searchParams.get('status')

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    const where: Prisma.LeadWhereInput = { customerId }
    if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
      where.status = status as LeadStatus
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        asset: { select: { id: true, name: true, address: true } },
        _count: { select: { notes: true, proposals: true } },
        cadenceAssignments: {
          include: {
            cadence: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ leads })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createLeadSchema.parse({
      ...body,
      email: body.email || undefined,
    })

    const lead = await prisma.lead.create({
      data: {
        customerId: data.customerId,
        name: data.name,
        company: data.company,
        email: data.email || null,
        phone: data.phone || null,
        status: data.status || LeadStatus.NEW,
        source: data.source || null,
        assetId: data.assetId || null,
      },
      include: {
        asset: { select: { id: true, name: true, address: true } },
      },
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
