import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const DEFAULT_ADMIN_EMAIL = 'jjbarrett12@gmail.com'
const DEFAULT_ADMIN_PASSWORD = 'Jb121212'

/**
 * One-time setup: create admin user if the request includes the correct secret.
 * Set CREATE_ADMIN_SECRET in Vercel (and .env locally), then POST { "secret": "that-value" }.
 * Remove CREATE_ADMIN_SECRET from Vercel after use for security.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const secret = typeof body?.secret === 'string' ? body.secret.trim() : ''
    const expected = process.env.CREATE_ADMIN_SECRET?.trim()

    if (!expected) {
      return NextResponse.json(
        { error: 'CREATE_ADMIN_SECRET is not set. Add it in Vercel (or .env) and try again.' },
        { status: 503 }
      )
    }

    if (secret !== expected) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 })
    }

    const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim()
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_EMAIL and ADMIN_PASSWORD must be set in env (or defaults used).' },
        { status: 503 }
      )
    }

    let customer = await prisma.customer.findUnique({ where: { email: adminEmail } })
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: 'Admin', email: adminEmail },
      })
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, customerId: customer.id, role: 'ADMIN' },
      create: {
        email: adminEmail,
        passwordHash,
        customerId: customer.id,
        role: 'ADMIN',
      },
    })

    return NextResponse.json({
      ok: true,
      message: `Admin user created. Sign in at /signin with ${adminEmail} and your ADMIN_PASSWORD.`,
      email: adminEmail,
    })
  } catch (e: unknown) {
    console.error('[create-admin]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
