import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProposalStatus, Prisma } from '@prisma/client'
import { z } from 'zod'

const updateProposalSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED']).optional(),
  sentAt: z.string().datetime().optional().nullable(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { lead: true },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json({ proposal })
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
    const data = updateProposalSchema.parse(body)

    const updateData: Prisma.ProposalUpdateInput = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.body !== undefined) updateData.body = data.body
    if (data.status !== undefined) updateData.status = data.status as ProposalStatus
    if (data.sentAt !== undefined) {
      updateData.sentAt = data.sentAt ? new Date(data.sentAt) : null
    }
    if (data.status === 'SENT' && !updateData.sentAt) {
      updateData.sentAt = new Date()
    }

    const proposal = await prisma.proposal.update({
      where: { id },
      data: updateData,
      include: { lead: true },
    })

    return NextResponse.json({ proposal })
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
    await prisma.proposal.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
