import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { geocodeAddress } from '@/lib/map/geocode'

function canAccessCustomerId(
  customerId: string,
  session: { user?: { customerId?: string; role?: string } } | null
): boolean {
  if (!session?.user) return false
  const role = (session.user as { role?: string }).role
  if (role === 'ADMIN') return true
  return session.user.customerId === customerId
}

const importSchema = z.object({
  customerId: z.string(),
  addresses: z.array(z.string().min(1)).min(1).max(50),
  radiusMiles: z.number().min(0.5).max(100).default(25),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { customerId, addresses, radiusMiles } = importSchema.parse(body)

    if (!canAccessCustomerId(customerId, session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const created: { id: string; name: string; address: string }[] = []
    const failed: { address: string; reason: string }[] = []

    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i]
      if (i > 0) await new Promise((r) => setTimeout(r, 1100)) // Nominatim: 1 req/sec
      try {
        const results = await geocodeAddress(addr.trim(), { limit: 1 })
        const r = results[0]
        if (!r) {
          failed.push({ address: addr, reason: 'Address not found' })
          continue
        }

        const name = r.displayName.length > 80 ? r.displayName.slice(0, 77) + '…' : r.displayName
        const existing = await prisma.asset.findFirst({
          where: {
            customerId,
            address: r.displayName,
            latitude: r.lat,
            longitude: r.lng,
          },
        })
        if (existing) {
          failed.push({ address: addr, reason: 'Duplicate area' })
          continue
        }

        const asset = await prisma.asset.create({
          data: {
            customerId,
            name,
            address: r.displayName,
            latitude: r.lat,
            longitude: r.lng,
            radiusMiles,
            type: 'POINT_RADIUS',
            source: 'import',
            displayLabel: r.displayName,
          },
        })

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

        created.push({ id: asset.id, name: asset.name, address: asset.address })
      } catch (e) {
        failed.push({ address: addr, reason: e instanceof Error ? e.message : 'Unknown error' })
      }
    }

    return NextResponse.json({ created, failed }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
