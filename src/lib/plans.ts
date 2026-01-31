export const PLAN_IDS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
} as const

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS]

export const PLANS: Record<
  PlanId,
  { name: string; price: number | null; priceLabel: string; description: string; features: string[] }
> = {
  starter: {
    name: 'Starter',
    price: 79,
    priceLabel: '$79/month',
    description: 'Weather alerts & event tracking',
    features: ['Up to 5 service areas', '500 alerts/month', 'SMS & Email alerts', 'Event dashboard', 'Email support'],
  },
  professional: {
    name: 'Professional',
    price: 199,
    priceLabel: '$199/month',
    description: 'Sales teams: track leads',
    features: [
      'Up to 25 service areas',
      '2,500 alerts/month',
      'All channels + API',
      'Event dashboard',
      'Lead tracking',
      'Notes per lead',
      'Priority support',
    ],
  },
  business: {
    name: 'Business',
    price: 399,
    priceLabel: '$399/month',
    description: 'Full sales toolkit',
    features: [
      'Up to 100 service areas',
      '10,000 alerts/month',
      'All features + webhooks',
      'Lead tracking & notes',
      'Proposals',
      'Follow-up cadences',
      'Multi-user access',
      'Dedicated support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    priceLabel: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited service areas',
      'Unlimited alerts',
      'Full sales toolkit',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee (99.9%)',
      'White-label options',
    ],
  },
}

const SALES_PLAN_IDS: readonly PlanId[] = [PLAN_IDS.PROFESSIONAL, PLAN_IDS.BUSINESS, PLAN_IDS.ENTERPRISE]

/** Plans that include any sales features (leads, proposals, cadences). */
export function hasSalesFeatures(plan: PlanId | string | null | undefined): boolean {
  if (!plan) return false
  return (SALES_PLAN_IDS as readonly string[]).includes(plan)
}

/** Can track leads and add notes (Professional+). */
export function canTrackLeads(plan: PlanId | string | null | undefined): boolean {
  return hasSalesFeatures(plan)
}

const BUSINESS_PLUS_IDS: readonly PlanId[] = [PLAN_IDS.BUSINESS, PLAN_IDS.ENTERPRISE]

/** Can create proposals and follow-up cadences (Business+). */
export function canProposalsAndCadences(plan: PlanId | string | null | undefined): boolean {
  if (!plan) return false
  return (BUSINESS_PLUS_IDS as readonly string[]).includes(plan)
}
