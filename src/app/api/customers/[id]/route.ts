import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DB_TIMEOUT_MS = 5000 // fail fast so dashboard doesn't hang

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ])
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await withTimeout(
      prisma.customer.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          planTier: true,
        },
      }),
      DB_TIMEOUT_MS
    )

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      customer: {
        ...customer,
        plan: customer.planTier?.toLowerCase() ?? null,
      },
    })
  } catch (error: any) {
    const message = error?.message === 'timeout' ? 'Service temporarily unavailable' : error?.message
    const status = error?.message === 'timeout' ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
