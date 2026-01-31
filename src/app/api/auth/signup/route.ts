import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { PLAN_IDS, type PlanId } from '@/lib/plans'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  company: z.string().optional(),
  phone: z.string().optional(),
  plan: z.enum([PLAN_IDS.STARTER, PLAN_IDS.PROFESSIONAL, PLAN_IDS.BUSINESS, PLAN_IDS.ENTERPRISE]).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = signupSchema.parse(body)

    const existing = await prisma.customer.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const planTier = data.plan ? data.plan.toUpperCase() : null

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        company: data.company ?? null,
        planTier: planTier,
      },
    })

    await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        customerId: customer.id,
      },
    })

    return NextResponse.json({
      customerId: customer.id,
      email: customer.email,
      plan: data.plan ?? null,
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 })
  }
}
