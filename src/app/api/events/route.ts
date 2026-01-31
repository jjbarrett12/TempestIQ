import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const eventType = searchParams.get('eventType')
    const limit = parseInt(searchParams.get('limit') || '50')
    const days = parseInt(searchParams.get('days') || '7')

    const where: any = {}
    
    if (assetId) {
      where.assetId = assetId
    } else if (customerId) {
      // Get events for all customer's assets
      const assets = await prisma.asset.findMany({
        where: { customerId },
        select: { id: true },
      })
      where.assetId = { in: assets.map(a => a.id) }
    }

    if (status) {
      where.status = status
    }

    if (eventType) {
      where.eventType = eventType
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    where.startTime = { gte: startDate }

    const events = await prisma.event.findMany({
      where,
      include: {
        asset: true,
      },
      orderBy: { startTime: 'desc' },
      take: limit,
    })

    return NextResponse.json({ events })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
