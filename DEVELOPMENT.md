# Development Guide

## Quick Commands

```bash
# Setup (first time)
npm run setup              # Interactive setup wizard

# Development
npm run dev                # Start Next.js dev server
npm run worker:all         # Start all background workers

# Database
npm run db:migrate         # Run migrations
npm run db:generate        # Generate Prisma client
npm run db:studio          # Open Prisma Studio (GUI)
npm run db:seed            # Create test data

# Testing & Validation
npm run validate:env       # Check environment variables
npm run test:apis          # Test all API connections

# Scheduler
npm run scheduler:init     # Initialize polling jobs (one-time)
```

## Development Workflow

### 1. First Time Setup

```bash
# Run interactive setup
npm run setup

# Or manual setup:
npm install
cp .env.example .env
# Edit .env with your API keys
npm run validate:env
npm run db:migrate
npm run db:generate
npm run db:seed
npm run scheduler:init
```

### 2. Daily Development

**Terminal 1: Next.js**
```bash
npm run dev
# Visit http://localhost:3005
```

**Terminal 2: Workers**
```bash
npm run worker:all
# Or separately:
npm run worker:polling
npm run worker:notifications
```

### 3. Testing Changes

```bash
# Test API connections
npm run test:apis

# Check health endpoint
curl http://localhost:3000/api/health

# View database
npm run db:studio
```

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                    # Next.js pages & API routes
│   │   ├── api/                # API endpoints
│   │   ├── dashboard/          # Customer dashboard
│   │   └── admin/              # Admin portal
│   ├── components/            # React components
│   ├── lib/                    # Utilities (Prisma, Redis)
│   ├── services/               # Business logic
│   │   ├── xweather/          # Xweather API client
│   │   ├── events/            # Event processing
│   │   └── notifications/     # SMS/Email delivery
│   └── workers/                # Background workers
└── scripts/                    # Utility scripts
```

## Key Files

### API Routes
- `src/app/api/assets/route.ts` - Asset CRUD
- `src/app/api/events/route.ts` - Event queries
- `src/app/api/notifications/route.ts` - Notification history
- `src/app/api/webhooks/xweather/route.ts` - Xweather webhooks
- `src/app/api/health/route.ts` - Health check

### Services
- `src/services/xweather/client.ts` - Xweather API wrapper
- `src/services/events/normalizer.ts` - Event normalization
- `src/services/events/matcher.ts` - Event-to-asset matching
- `src/services/notifications/dispatcher.ts` - Notification delivery

### Workers
- `src/workers/polling-worker.ts` - Fetches weather data
- `src/workers/notification-worker.ts` - Sends notifications

## Debugging

### Check Worker Logs
Workers log to console. Look for:
- `[Polling Worker]` - Weather data fetching
- `[Notification Worker]` - Notification delivery

### Database Debugging
```bash
# Open Prisma Studio (visual database browser)
npm run db:studio

# Or use psql directly
psql $DATABASE_URL
```

### Redis Debugging
```bash
# Connect to Redis CLI
redis-cli

# Check queues
KEYS *
LLEN bull:polling:wait
LLEN bull:notifications:wait
```

### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Test endpoints
curl http://localhost:3005/api/assets?customerId=demo-customer-1
curl http://localhost:3005/api/events?customerId=demo-customer-1
```

## Common Issues

### Workers Not Processing Jobs
1. Check Redis is running: `redis-cli ping`
2. Verify `REDIS_URL` in `.env`
3. Check worker logs for errors
4. Ensure scheduler initialized: `npm run scheduler:init`

### Database Connection Errors
1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
2. Check database is running
3. Run `npm run db:generate` to regenerate Prisma client

### API Errors
1. Run `npm run validate:env` to check credentials
2. Run `npm run test:apis` to test connections
3. Check API key permissions/limits
4. Review error messages in console

### No Events Showing
1. Verify polling worker is running
2. Check Xweather API key is valid
3. Look for errors in worker logs
4. Verify assets exist and are active
5. Check event status in database: `npm run db:studio`

## Environment Variables

See `.env.example` for all variables. Key ones:

- `DATABASE_URL` - PostgreSQL connection string
- `XWEATHER_API_KEY` - Xweather API key
- `TWILIO_*` - Twilio SMS credentials
- `SENDGRID_API_KEY` - SendGrid email API key
- `REDIS_URL` - Redis connection URL

## Code Style

- TypeScript strict mode enabled
- ESLint configured for Next.js
- Prefer async/await over promises
- Use Prisma for database queries
- Use Zod for input validation

## Adding New Features

### Adding a New API Endpoint
1. Create file in `src/app/api/[route]/route.ts`
2. Export GET/POST/PATCH/DELETE handlers
3. Add input validation with Zod
4. Use Prisma for database operations
5. Return JSON responses

### Adding a New Service
1. Create directory in `src/services/[service-name]/`
2. Export main service class/function
3. Add types in `types.ts`
4. Import in workers/API routes as needed

### Adding a New Worker
1. Create file in `src/workers/[worker-name].ts`
2. Use BullMQ Worker class
3. Add to `scripts/start-workers.ts`
4. Create queue in `src/lib/scheduler.ts` if needed

## Testing

Currently no automated tests. To add:

1. Install testing framework (Jest/Vitest)
2. Add test files next to source files
3. Test critical paths:
   - Event normalization
   - Deduplication logic
   - Notification formatting
   - API endpoints

## Deployment

See production deployment guide (to be added). Key considerations:

- Environment variables in hosting platform
- Database migrations run automatically
- Workers deployed separately (or via cron)
- Redis hosted separately
- SSL/HTTPS enabled
- Monitoring configured

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [BullMQ Docs](https://docs.bullmq.io/)
- [Xweather Docs](https://www.aerisweather.com/support/docs/)
