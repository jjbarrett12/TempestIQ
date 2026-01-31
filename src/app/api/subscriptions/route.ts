import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSubscriptionSchema = z.object({
  tornadoWarning: z.boolean().optional(),
  tornadoWatch: z.boolean().optional(),
  severeTstormWarning: z.boolean().optional(),
  hailThreat: z.boolean().optional(),
  extremeWind: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  webhookUrl: z.string().url().nullable().optional(),
  quietHoursStart: z.number().min(0).max(23).nullable().optional(),
  quietHoursEnd: z.number().min(0).max(23).nullable().optional(),
  requireAck: z.boolean().optional(),
  escalationDelay: z.number().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')
    const customerId = searchParams.get('customerId')

    const where: any = {}
    if (assetId) where.assetId = assetId
    if (customerId) where.customerId = customerId

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        asset: true,
        customer: true,
      },
    })

    return NextResponse.json({ subscriptions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Subscription id required' }, { status: 400 })
    }

    const validated = updateSubscriptionSchema.parse(data)

    const subscription = await prisma.subscription.update({
      where: { id },
      data: validated,
      include: {
        asset: true,
        customer: true,
      },
    })

    return NextResponse.json({ subscription })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
