import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { PLAN_IDS, type PlanId } from '@/lib/plans'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const PRICE_IDS: Partial<Record<PlanId, string>> = {
  [PLAN_IDS.STARTER]: process.env.STRIPE_PRICE_STARTER ?? undefined,
  [PLAN_IDS.PROFESSIONAL]: process.env.STRIPE_PRICE_PROFESSIONAL ?? undefined,
  [PLAN_IDS.BUSINESS]: process.env.STRIPE_PRICE_BUSINESS ?? undefined,
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Billing is not configured. Please contact sales.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { customerId, plan, successUrl, cancelUrl } = body as {
      customerId: string
      plan: PlanId
      successUrl?: string
      cancelUrl?: string
    }

    if (!customerId || !plan) {
      return NextResponse.json({ error: 'customerId and plan are required' }, { status: 400 })
    }

    if (plan === PLAN_IDS.ENTERPRISE) {
      return NextResponse.json(
        { error: 'Enterprise plans require a custom quote. Please use Contact Sales.' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      return NextResponse.json(
        { error: `Plan "${plan}" is not available for checkout. Please contact sales.` },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${baseUrl}/dashboard?subscription=success`,
      cancel_url: cancelUrl ?? `${baseUrl}/signup?subscription=cancelled`,
      client_reference_id: customerId,
      customer_email: customer.email,
      metadata: {
        customerId,
        plan,
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: { customerId, plan },
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
