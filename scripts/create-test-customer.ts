#!/usr/bin/env tsx
/**
 * Create a test customer and user for development
 * Usage: tsx scripts/create-test-customer.ts
 */

import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

const DEMO_EMAIL = 'demo@example.com'
const DEMO_PASSWORD = 'password123'

async function main() {
  console.log('Creating test customer...')

  const customer = await prisma.customer.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: 'Demo Customer',
      email: DEMO_EMAIL,
      phone: '+1234567890',
    },
  })

  console.log('✅ Customer created:', customer)

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
  console.log('✅ Demo user created (for sign-in)')

  // Create a test asset
  const asset = await prisma.asset.create({
    data: {
      customerId: customer.id,
      name: 'Test Location',
      address: '123 Main St, New York, NY 10001',
      latitude: 40.7128,
      longitude: -74.0060,
      radiusMiles: 5,
      timezone: 'America/New_York',
    },
  })

  console.log('✅ Test asset created:', asset)

  // Create default subscription
  const subscription = await prisma.subscription.create({
    data: {
      customerId: customer.id,
      assetId: asset.id,
      tornadoWarning: true,
      severeTstormWarning: true,
      hailThreat: true,
      extremeWind: true,
      smsEnabled: true,
      emailEnabled: true,
    },
  })

  console.log('✅ Subscription created:', subscription)
  console.log('\n🎉 Test data created successfully!')
  console.log(`Customer ID: ${customer.id}`)
  console.log(`Asset ID: ${asset.id}`)
  console.log('\n📌 Sign in with:')
  console.log(`   Email:    ${DEMO_EMAIL}`)
  console.log(`   Password: ${DEMO_PASSWORD}`)
  console.log('\n   Go to /signin and use the credentials above.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
