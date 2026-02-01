import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customerId')
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const where: any = {
      date: { gte: startDate },
    }
    if (customerId) where.customerId = customerId

    const usage = await prisma.usageToken.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { source: 'asc' }],
    })

    // Aggregate by customer and date
    const aggregated = usage.reduce((acc: any, record) => {
      const key = `${record.customerId}-${record.date.toISOString()}`
      if (!acc[key]) {
        acc[key] = {
          customerId: record.customerId,
          customer: record.customer,
          date: record.date,
          totalTokens: 0,
          bySource: {},
        }
      }
      acc[key].totalTokens += record.tokens
      acc[key].bySource[record.source] = record.tokens
      return acc
    }, {})

    return NextResponse.json({
      usage: Object.values(aggregated),
      raw: usage,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
