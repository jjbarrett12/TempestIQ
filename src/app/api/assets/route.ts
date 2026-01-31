import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAssetSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMiles: z.number().min(0.5).max(50).default(5),
  timezone: z.string().default('America/New_York'),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
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
    const body = await request.json()
    const { customerId, ...data } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    const validated = createAssetSchema.parse(data)

    const asset = await prisma.asset.create({
      data: {
        ...validated,
        customerId,
      },
      include: {
        subscriptions: true,
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
