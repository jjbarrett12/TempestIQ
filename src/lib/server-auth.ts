import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DEFAULT_ORG_ID } from '@/lib/storms/mock-data'

export async function requireOrgContext() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.customerId ?? DEFAULT_ORG_ID
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null
  return { orgId, userId, isDemo: !session?.user?.customerId }
}
