#!/usr/bin/env tsx
/**
 * Reset the demo user's password so you can sign in.
 * Run this if demo@example.com / password123 doesn't work.
 *
 * Usage: tsx scripts/reset-demo-password.ts
 * Or:    npm run reset-demo-password
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env from project root (npm run sets cwd to project root)
config({ path: resolve(process.cwd(), '.env') })

import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

const DEMO_EMAIL = 'demo@example.com'
const DEMO_PASSWORD = 'password123'

async function main() {
  console.log('Resetting demo user password...\n')

  let customer = await prisma.customer.findUnique({ where: { email: DEMO_EMAIL } })
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: 'Demo Customer',
        email: DEMO_EMAIL,
        phone: '+1234567890',
      },
    })
    console.log('Created demo customer.')
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash, customerId: customer.id },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      customerId: customer.id,
    },
  })

  console.log('✅ Demo password reset.\n')
  console.log('Sign in at /signin with:')
  console.log('   Email:    demo@example.com')
  console.log('   Password: password123')
  console.log('\n(Copy/paste the password to avoid typos.)')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
