#!/usr/bin/env tsx
/**
 * Test all API connections
 * Run this to verify your API keys are working
 * Usage: tsx scripts/test-api-connections.ts
 */

import { config } from 'dotenv'
import { prisma } from '../src/lib/prisma'
import { getRedisConnection } from '../src/lib/redis'
import { getXweatherClient } from '../src/services/xweather/client'
import twilio from 'twilio'
import sgMail from '@sendgrid/mail'

config()

async function testDatabase() {
  console.log('\n🗄️  Testing Database...')
  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful')
    return true
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function testRedis() {
  console.log('\n🔴 Testing Redis...')
  try {
    const redis = getRedisConnection()
    const result = await redis.ping()
    if (result === 'PONG') {
      console.log('✅ Redis connection successful')
      return true
    }
    console.error('❌ Redis ping failed')
    return false
  } catch (error: any) {
    console.error('❌ Redis connection failed:', error.message)
    return false
  }
}

async function testXweather() {
  console.log('\n🌦️  Testing Xweather API...')
  try {
    if (!process.env.XWEATHER_API_KEY) {
      console.error('❌ XWEATHER_API_KEY not set')
      return false
    }

    const client = getXweatherClient()
    // Try a simple alerts query (this might cost tokens)
    const response = await client.getAlerts({ country: 'US' })
    console.log('✅ Xweather API connection successful')
    console.log(`   Cost: ${response.headers['x-cost-tokens'] || 'unknown'} tokens`)
    return true
  } catch (error: any) {
    console.error('❌ Xweather API failed:', error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Response:', error.response.data)
    }
    return false
  }
}

async function testTwilio() {
  console.log('\n📱 Testing Twilio...')
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      console.error('❌ Twilio credentials not set')
      return false
    }

    const client = twilio(accountSid, authToken)
    const account = await client.api.accounts(accountSid).fetch()
    console.log('✅ Twilio connection successful')
    console.log(`   Account: ${account.friendlyName}`)
    return true
  } catch (error: any) {
    console.error('❌ Twilio connection failed:', error.message)
    return false
  }
}

async function testSendGrid() {
  console.log('\n📧 Testing SendGrid...')
  try {
    const apiKey = process.env.SENDGRID_API_KEY

    if (!apiKey) {
      console.error('❌ SENDGRID_API_KEY not set')
      return false
    }

    sgMail.setApiKey(apiKey)
    
    // Test API key by checking user info
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ SendGrid connection successful')
      console.log(`   Email: ${data.email}`)
      return true
    } else {
      const error = await response.text()
      console.error('❌ SendGrid API failed:', error)
      return false
    }
  } catch (error: any) {
    console.error('❌ SendGrid connection failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🧪 Testing API Connections\n')
  console.log('=' .repeat(50))

  const results = {
    database: await testDatabase(),
    redis: await testRedis(),
    xweather: await testXweather(),
    twilio: await testTwilio(),
    sendgrid: await testSendGrid(),
  }

  console.log('\n' + '='.repeat(50))
  console.log('\n📊 Test Results Summary:')
  console.log('='.repeat(50))

  Object.entries(results).forEach(([service, passed]) => {
    const icon = passed ? '✅' : '❌'
    const status = passed ? 'PASS' : 'FAIL'
    console.log(`${icon} ${service.padEnd(15)} ${status}`)
  })

  const allPassed = Object.values(results).every(r => r)
  
  if (allPassed) {
    console.log('\n🎉 All connections successful! You\'re ready to go.')
  } else {
    console.log('\n⚠️  Some connections failed. Check your .env file and API keys.')
    console.log('   See HOW_TO_GET_API_KEYS.md for help obtaining credentials.')
  }

  process.exit(allPassed ? 0 : 1)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
