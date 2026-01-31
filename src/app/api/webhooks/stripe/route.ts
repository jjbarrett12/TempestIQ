import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.client_reference_id ?? session.metadata?.customerId
        const plan = session.metadata?.plan as string | undefined
        const subscriptionId = session.subscription as string | undefined
        const stripeCustomerId = session.customer as string | undefined

        if (customerId && plan) {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              planTier: plan.toUpperCase(),
              stripeCustomerId: stripeCustomerId ?? undefined,
              stripeSubscriptionId: subscriptionId ?? undefined,
            },
          })
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.metadata?.customerId
        if (customerId) {
          const planTier =
            event.type === 'customer.subscription.deleted'
              ? null
              : (sub.metadata?.plan as string | undefined)?.toUpperCase() ?? undefined
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              planTier: planTier ?? null,
              stripeSubscriptionId:
                event.type === 'customer.subscription.deleted' ? null : sub.id,
            },
          })
        }
        break
      }
      default:
        // Unhandled event type
        break
    }
  } catch (err) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
