#!/usr/bin/env tsx
/**
 * Create or update an admin user.
 * Usage: tsx scripts/create-admin.ts
 * Or:    npm run create-admin
 *
 * Creates jjbarrett12@gmail.com with role ADMIN and the password below.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Load .env from project root (no dotenv dependency)
const envPath = resolve(process.cwd(), '.env')
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) {
      const value = m[2].replace(/^["']|["']$/g, '').trim()
      if (!process.env[m[1]]) process.env[m[1]] = value
    }
  }
}

import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'jjbarrett12@gmail.com'
const ADMIN_PASSWORD = 'Jb121212'

async function main() {
  console.log('Creating admin user...\n')

  let customer = await prisma.customer.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: 'Admin',
        email: ADMIN_EMAIL,
      },
    })
    console.log('Created customer for', ADMIN_EMAIL)
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, customerId: customer.id, role: 'ADMIN' },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      customerId: customer.id,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user ready.\n')
  console.log('Sign in at /signin with:')
  console.log('   Email:   ', ADMIN_EMAIL)
  console.log('   Password:', ADMIN_PASSWORD)
  console.log('\nThen open /admin for the admin portal.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
