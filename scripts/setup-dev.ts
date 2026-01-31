#!/usr/bin/env tsx
/**
 * Interactive development setup script
 * Guides you through initial setup
 * Usage: tsx scripts/setup-dev.ts
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { config } from 'dotenv'

console.log('🚀 Roof Alert - Development Setup\n')
console.log('='.repeat(50))

// Step 1: Check .env file
console.log('\n📝 Step 1: Checking .env file...')
if (!existsSync('.env')) {
  if (existsSync('.env.example')) {
    console.log('   Copying .env.example to .env...')
    const example = readFileSync('.env.example', 'utf-8')
    writeFileSync('.env', example)
    console.log('   ✅ Created .env file')
    console.log('   ⚠️  Please edit .env and add your API keys!')
    console.log('   📖 See HOW_TO_GET_API_KEYS.md for help')
  } else {
    console.log('   ❌ .env.example not found!')
    process.exit(1)
  }
} else {
  console.log('   ✅ .env file exists')
}

// Step 2: Validate environment
console.log('\n🔍 Step 2: Validating environment...')
try {
  execSync('tsx scripts/validate-env.ts', { stdio: 'inherit' })
} catch (error) {
  console.log('\n   ⚠️  Some environment variables are missing')
  console.log('   You can continue, but some features may not work')
}

// Step 3: Install dependencies
console.log('\n📦 Step 3: Checking dependencies...')
if (!existsSync('node_modules')) {
  console.log('   Installing dependencies (this may take a minute)...')
  try {
    execSync('npm install', { stdio: 'inherit' })
    console.log('   ✅ Dependencies installed')
  } catch (error) {
    console.log('   ❌ Failed to install dependencies')
    process.exit(1)
  }
} else {
  console.log('   ✅ Dependencies already installed')
}

// Step 4: Database setup
console.log('\n🗄️  Step 4: Database setup...')
config()
if (process.env.DATABASE_URL) {
  console.log('   Running database migrations...')
  try {
    execSync('npm run db:migrate', { stdio: 'inherit' })
    console.log('   ✅ Database migrations complete')
    
    console.log('   Generating Prisma client...')
    execSync('npm run db:generate', { stdio: 'inherit' })
    console.log('   ✅ Prisma client generated')
  } catch (error) {
    console.log('   ⚠️  Database setup failed - make sure DATABASE_URL is correct')
  }
} else {
  console.log('   ⚠️  DATABASE_URL not set - skipping database setup')
}

// Step 5: Test connections
console.log('\n🧪 Step 5: Testing API connections...')
console.log('   (This will verify your API keys are working)')
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

readline.question('\n   Test API connections now? (y/n): ', (answer: string) => {
  if (answer.toLowerCase() === 'y') {
    try {
      execSync('npm run test:apis', { stdio: 'inherit' })
    } catch (error) {
      console.log('   ⚠️  Some API tests failed - check your credentials')
    }
  } else {
    console.log('   Skipped - run "npm run test:apis" later')
  }

  // Step 6: Create test data
  console.log('\n📊 Step 6: Creating test data...')
  readline.question('   Create test customer and asset? (y/n): ', (answer: string) => {
    if (answer.toLowerCase() === 'y') {
      try {
        execSync('npm run db:seed', { stdio: 'inherit' })
        console.log('   ✅ Test data created')
      } catch (error) {
        console.log('   ⚠️  Failed to create test data')
      }
    } else {
      console.log('   Skipped - run "npm run db:seed" later')
    }

    // Step 7: Initialize scheduler
    console.log('\n⏰ Step 7: Scheduler setup...')
    readline.question('   Initialize polling scheduler? (y/n): ', (answer: string) => {
      if (answer.toLowerCase() === 'y') {
        try {
          execSync('npm run scheduler:init', { stdio: 'inherit' })
          console.log('   ✅ Scheduler initialized')
        } catch (error) {
          console.log('   ⚠️  Failed to initialize scheduler')
        }
      } else {
        console.log('   Skipped - run "npm run scheduler:init" later')
      }

      // Summary
      console.log('\n' + '='.repeat(50))
      console.log('✅ Setup complete!\n')
      console.log('Next steps:')
      console.log('  1. Start Next.js:     npm run dev')
      console.log('  2. Start workers:      npm run worker:all')
      console.log('  3. Visit dashboard:    http://localhost:3000/dashboard')
      console.log('\n📚 Documentation:')
      console.log('  - QUICKSTART.md - Quick start guide')
      console.log('  - HOW_TO_GET_API_KEYS.md - API setup help')
      console.log('  - ARCHITECTURE.md - System overview')
      
      readline.close()
    })
  })
})
