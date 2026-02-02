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

const CATEGORIES = ['nws', 'hail', 'wind'] as const
const SENSITIVITIES = ['CRITICAL_ONLY', 'STANDARD', 'AGGRESSIVE'] as const

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: customerId } = await params
    if (!canAccess(customerId, session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const prefs = await prisma.customerAlertPreference.findMany({
      where: { customerId },
    })
    const map = Object.fromEntries(prefs.map((p) => [p.category, { enabled: p.enabled, sensitivity: p.sensitivity }]))
    const defaults = CATEGORIES.map((c) => ({
      category: c,
      enabled: map[c]?.enabled ?? (c === 'nws'),
      sensitivity: map[c]?.sensitivity ?? 'STANDARD',
    }))
    return NextResponse.json({ preferences: defaults, planLimit: 3 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

const updateSchema = z.object({
  category: z.enum(CATEGORIES),
  enabled: z.boolean(),
  sensitivity: z.enum(SENSITIVITIES),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: customerId } = await params
    if (!canAccess(customerId, session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const data = updateSchema.parse(body)

    await prisma.customerAlertPreference.upsert({
      where: {
        customerId_category: { customerId, category: data.category },
      },
      create: {
        customerId,
        category: data.category,
        enabled: data.enabled,
        sensitivity: data.sensitivity,
      },
      update: {
        enabled: data.enabled,
        sensitivity: data.sensitivity,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
