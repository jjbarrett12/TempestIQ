import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createNoteSchema = z.object({
  content: z.string().min(1),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true },
    })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const notes = await prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ notes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params
    const body = await request.json()
    const { content } = createNoteSchema.parse(body)

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true },
    })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const note = await prisma.note.create({
      data: { leadId, content },
    })
    return NextResponse.json({ note }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
