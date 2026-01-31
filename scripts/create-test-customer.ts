#!/usr/bin/env tsx
/**
 * Create a test customer for development
 * Usage: tsx scripts/create-test-customer.ts
 */

import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Creating test customer...')

  const customer = await prisma.customer.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'demo@example.com',
      phone: '+1234567890',
    },
  })

  console.log('✅ Customer created:', customer)

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
  console.log('\nYou can now use customerId="demo-customer-1" in the dashboard')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
