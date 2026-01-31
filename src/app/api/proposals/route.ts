import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProposalStatus, Prisma } from '@prisma/client'
import { z } from 'zod'

const createProposalSchema = z.object({
  customerId: z.string().min(1),
  leadId: z.string().optional().nullable(),
  title: z.string().min(1),
  body: z.string(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customerId')
    const leadId = request.nextUrl.searchParams.get('leadId')

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    const where: Prisma.ProposalWhereInput = { customerId }
    if (leadId) where.leadId = leadId

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, company: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ proposals })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createProposalSchema.parse(body)

    const proposal = await prisma.proposal.create({
      data: {
        customerId: data.customerId,
        leadId: data.leadId || null,
        title: data.title,
        body: data.body,
        status: data.status || ProposalStatus.DRAFT,
      },
      include: {
        lead: { select: { id: true, name: true, company: true } },
      },
    })

    return NextResponse.json({ proposal }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
