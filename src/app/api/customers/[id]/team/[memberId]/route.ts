import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

function canAccess(customerId: string, session: { user?: { customerId?: string; role?: string } } | null): boolean {
  if (!session?.user) return false
  const role = (session.user as { role?: string }).role
  if (role === 'ADMIN') return true
  return session.user.customerId === customerId
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: customerId, memberId } = await params
    if (!canAccess(customerId, session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.teamMember.deleteMany({
      where: { id: memberId, customerId },
    })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to remove' }, { status: 500 })
  }
}
