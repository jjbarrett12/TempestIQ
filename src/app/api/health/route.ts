import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRedisConnection } from '@/lib/redis'

const CHECK_TIMEOUT_MS = 3000 // fail fast so health doesn't hang

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ])
}

export async function GET() {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {},
  }

  // Check database (with timeout so site doesn't hang)
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, CHECK_TIMEOUT_MS)
    health.services.database = { status: 'ok' }
  } catch (error: any) {
    health.services.database = { status: 'error', error: error.message === 'timeout' ? 'timeout' : error.message }
    health.status = 'degraded'
  }

  // Check Redis (with timeout)
  try {
    const redis = getRedisConnection()
    const result = await withTimeout(redis.ping(), CHECK_TIMEOUT_MS)
    if (result === 'PONG') {
      health.services.redis = { status: 'ok' }
    } else {
      health.services.redis = { status: 'error', error: 'Unexpected response' }
      health.status = 'degraded'
    }
  } catch (error: any) {
    health.services.redis = { status: 'error', error: error.message === 'timeout' ? 'timeout' : error.message }
    health.status = 'degraded'
  }

  // Check environment variables (without exposing values)
  const requiredEnvVars = [
    'DATABASE_URL',
    'XWEATHER_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'SENDGRID_API_KEY',
    'REDIS_URL',
  ]

  const envStatus: Record<string, boolean> = {}
  requiredEnvVars.forEach(varName => {
    envStatus[varName] = !!process.env[varName]
  })

  health.services.environment = {
    status: Object.values(envStatus).every(v => v) ? 'ok' : 'missing',
    variables: envStatus,
  }

  if (!Object.values(envStatus).every(v => v)) {
    health.status = 'degraded'
  }

  const statusCode = health.status === 'ok' ? 200 : 503
  return NextResponse.json(health, { status: statusCode })
}
