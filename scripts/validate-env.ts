#!/usr/bin/env tsx
/**
 * Validate environment variables before starting
 * Usage: tsx scripts/validate-env.ts
 */

import { config } from 'dotenv'
import { existsSync } from 'fs'

config()

const requiredVars = [
  'DATABASE_URL',
  'XWEATHER_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'SENDGRID_API_KEY',
  'REDIS_URL',
]

const optionalVars = [
  'SENDGRID_FROM_EMAIL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
]

function validateEnv() {
  console.log('🔍 Validating environment variables...\n')

  if (!existsSync('.env')) {
    console.error('❌ .env file not found!')
    console.log('   Copy .env.example to .env and fill in your credentials.')
    process.exit(1)
  }

  let hasErrors = false
  const missing: string[] = []
  const empty: string[] = []

  // Check required variables
  console.log('Required variables:')
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (!value) {
      missing.push(varName)
      console.log(`  ❌ ${varName} - MISSING`)
      hasErrors = true
    } else if (value.trim() === '') {
      empty.push(varName)
      console.log(`  ⚠️  ${varName} - EMPTY`)
      hasErrors = true
    } else {
      // Mask sensitive values
      const masked = varName.includes('SECRET') || varName.includes('TOKEN') || varName.includes('KEY')
        ? `${value.substring(0, 8)}...`
        : value
      console.log(`  ✅ ${varName} - ${masked}`)
    }
  })

  // Check optional variables
  console.log('\nOptional variables:')
  optionalVars.forEach(varName => {
    const value = process.env[varName]
    if (!value || value.trim() === '') {
      console.log(`  ⚠️  ${varName} - Not set (optional)`)
    } else {
      const masked = varName.includes('SECRET') || varName.includes('TOKEN') || varName.includes('KEY')
        ? `${value.substring(0, 8)}...`
        : value
      console.log(`  ✅ ${varName} - ${masked}`)
    }
  })

  // Validate formats
  console.log('\nFormat validation:')
  
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log('  ⚠️  DATABASE_URL should start with "postgresql://"')
  } else if (process.env.DATABASE_URL) {
    console.log('  ✅ DATABASE_URL format looks good')
  }

  if (process.env.REDIS_URL && !process.env.REDIS_URL.startsWith('redis://')) {
    console.log('  ⚠️  REDIS_URL should start with "redis://"')
  } else if (process.env.REDIS_URL) {
    console.log('  ✅ REDIS_URL format looks good')
  }

  if (process.env.TWILIO_PHONE_NUMBER && !process.env.TWILIO_PHONE_NUMBER.startsWith('+')) {
    console.log('  ⚠️  TWILIO_PHONE_NUMBER should start with "+"')
  } else if (process.env.TWILIO_PHONE_NUMBER) {
    console.log('  ✅ TWILIO_PHONE_NUMBER format looks good')
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  if (hasErrors) {
    console.log('❌ Validation failed!')
    if (missing.length > 0) {
      console.log(`\nMissing variables: ${missing.join(', ')}`)
      console.log('See HOW_TO_GET_API_KEYS.md for help obtaining credentials.')
    }
    if (empty.length > 0) {
      console.log(`\nEmpty variables: ${empty.join(', ')}`)
      console.log('Please fill in these values in your .env file.')
    }
    process.exit(1)
  } else {
    console.log('✅ All required environment variables are set!')
    console.log('\nNext steps:')
    console.log('  1. Run: npm run test:apis (to test connections)')
    console.log('  2. Run: npm run db:migrate (to set up database)')
    console.log('  3. Run: npm run db:seed (to create test data)')
  }
}

validateEnv()
