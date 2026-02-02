import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  tornadoWarning: z.boolean().optional(),
  severeTstormWarning: z.boolean().optional(),
  hailThreat: z.boolean().optional(),
  extremeWind: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: assetId } = await params
    const body = await request.json()
    const data = updateSchema.parse(body)

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { subscriptions: true },
    })
    if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const role = (session.user as { role?: string }).role
    if (role !== 'ADMIN' && asset.customerId !== (session.user as { customerId?: string }).customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sub = asset.subscriptions[0]
    if (!sub) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

    await prisma.subscription.update({
      where: { id: sub.id },
      data,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
