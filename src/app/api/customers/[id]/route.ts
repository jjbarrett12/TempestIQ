import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const DB_TIMEOUT_MS = 5000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ])
}

function canAccessCustomer(customerId: string, session: { user?: { customerId?: string; role?: string } } | null): boolean {
  if (!session?.user) return false
  const role = (session.user as { role?: string }).role
  if (role === 'ADMIN') return true
  return session.user.customerId === customerId
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    if (!canAccessCustomer(id, session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const customer = await withTimeout(
      prisma.customer.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          logoUrl: true,
          planTier: true,
          alertProfile: true,
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

const alertProfileSchema = z.object({
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.number().min(0).max(23),
    end: z.number().min(0).max(23),
  }).optional(),
  urgentOverride: z.boolean().optional(),
}).optional()

const updateCustomerSchema = z.object({
  company: z.string().optional(),
  alertProfile: alertProfileSchema,
  logoUrl: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) =>
        !v ||
        v.startsWith('http://') ||
        v.startsWith('https://') ||
        (v.startsWith('data:') && v.includes('image/')),
      { message: 'Logo must be a URL or image data (e.g. from file upload)' }
    ),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    if (!canAccessCustomer(id, session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateCustomerSchema.parse(body)

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.company !== undefined && { company: data.company }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.alertProfile !== undefined && { alertProfile: data.alertProfile as object }),
      },
      select: { id: true, name: true, email: true, company: true, logoUrl: true, planTier: true, alertProfile: true },
    })

    return NextResponse.json({
      customer: { ...customer, plan: customer.planTier?.toLowerCase() ?? null },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 })
    }
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 })
  }
}
