import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

function canAccessCustomerId(
  customerId: string,
  session: { user?: { customerId?: string; role?: string } } | null
): boolean {
  if (!session?.user) return false
  const role = (session.user as { role?: string }).role
  if (role === 'ADMIN') return true
  return session.user.customerId === customerId
}

const createAssetSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMiles: z.number().min(0.5).max(100).default(25),
  timezone: z.string().default('America/New_York'),
  type: z.enum(['POINT_RADIUS', 'ZIP', 'COUNTY', 'CITY', 'POLYGON']).default('POINT_RADIUS'),
  geometry: z.record(z.unknown()).nullable().optional(),
  displayLabel: z.string().nullable().optional(),
  source: z.enum(['manual', 'search', 'import']).default('search'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }
    if (!canAccessCustomerId(customerId, session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const assets = await prisma.asset.findMany({
      where: { customerId },
      include: {
        subscriptions: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ assets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { customerId, ...data } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }
    if (!canAccessCustomerId(customerId, session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const validated = createAssetSchema.parse(data)
    const name = validated.name ?? validated.displayLabel ?? validated.address ?? `Area ${new Date().toISOString().slice(0, 10)}`

    const asset = await prisma.asset.create({
      data: {
        ...validated,
        name,
        customerId,
        geometry: (validated.geometry ?? undefined) as Prisma.InputJsonValue | undefined,
        displayLabel: validated.displayLabel ?? undefined,
      },
    })

    // Create default subscription
    await prisma.subscription.create({
      data: {
        customerId,
        assetId: asset.id,
        tornadoWarning: true,
        severeTstormWarning: true,
        hailThreat: true,
        extremeWind: true,
        smsEnabled: true,
        emailEnabled: true,
      },
    })

    return NextResponse.json({ asset }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
