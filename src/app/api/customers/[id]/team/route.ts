import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

function canAccess(customerId: string, session: { user?: { customerId?: string; role?: string } } | null): boolean {
  if (!session?.user) return false
  const role = (session.user as { role?: string }).role
  if (role === 'ADMIN') return true
  return session.user.customerId === customerId
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    if (!canAccess(id, session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const members = await prisma.teamMember.findMany({
      where: { customerId: id },
      orderBy: { email: 'asc' },
    })
    return NextResponse.json({ teamMembers: members })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load team' }, { status: 500 })
  }
}

const addMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    if (!canAccess(id, session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = addMemberSchema.parse(body)

    const member = await prisma.teamMember.upsert({
      where: {
        customerId_email: { customerId: id, email: data.email.toLowerCase().trim() },
      },
      update: { name: data.name?.trim() || null },
      create: {
        customerId: id,
        email: data.email.toLowerCase().trim(),
        name: data.name?.trim() || null,
      },
    })
    return NextResponse.json({ teamMember: member }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 })
    }
    return NextResponse.json({ error: error?.message || 'Failed to add team member' }, { status: 500 })
  }
}
