import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DEFAULT_ORG_ID } from '@/lib/storms/mock-data'

export async function requireOrgContext() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.customerId ?? DEFAULT_ORG_ID
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null
  return { orgId, userId, isDemo: !session?.user?.customerId }
}

/** Throws if not signed in or not ADMIN. Use in API routes. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return session
}
