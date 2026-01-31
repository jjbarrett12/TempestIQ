# StormBridge Platform

**AI-Powered Lead Generation for Roofing & Insurance**

StormBridge is a lead generation platform that uses advanced weather intelligence to help roofing companies and insurance agencies turn severe weather events into qualified leads. We monitor hail, tornado, and extreme wind events using Xweather, then deliver real-time alerts via SMS, email, push notifications, and in-app notifications.

**→ If the site keeps timing out or hanging**, see **[RUN_LIVE.md](./RUN_LIVE.md)** for timeouts, env vars, and how to run it live.

## What to set up

**→ See [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** for a prioritized list. In short:

- **Must-have**: PostgreSQL, `.env`, migrations, `npm install`, then run `START_SERVER.bat` or `npm run dev`.
- **Full product**: Redis, Xweather, Stripe (see [STRIPE_SETUP.md](./STRIPE_SETUP.md)), Twilio, SendGrid, then scheduler + workers.
- **Before launch**: Sign-in/session (e.g. NextAuth), live Stripe, domain + SSL, env in production.

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API routes + Node.js workers
- **Database**: PostgreSQL (via Prisma)
- **Queue**: BullMQ with Redis
- **Notifications**: Twilio (SMS), SendGrid (Email)

## Getting Started

### Step 1: Get API Keys

**First, obtain all required API keys and credentials. See [HOW_TO_GET_API_KEYS.md](./HOW_TO_GET_API_KEYS.md) for detailed instructions.**

You'll need:
- Xweather API key (weather data)
- Twilio credentials (SMS)
- SendGrid API key (email)
- PostgreSQL database
- Redis instance

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
# Edit .env with your API keys
```

### Step 4: Test Connections

Verify all API keys are working:

```bash
npm run test:apis
```

### Step 5: Set Up Database

```bash
npm run db:migrate
npm run db:generate
npm run db:seed  # Create test customer
```

### Step 6: Initialize Scheduler

```bash
npm run scheduler:init
```

### Step 7: Start the Application

**Terminal 1: Next.js Server**
```bash
npm run dev
```

**Terminal 2: Background Workers**
```bash
npm run worker:all
```

Visit http://localhost:3005/dashboard to see the platform!

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/lib` - Shared utilities and services
- `/src/services` - Business logic (Xweather, notifications, events)
- `/src/workers` - Background workers for polling
- `/prisma` - Database schema and migrations

## Features

- **Customer Portal**: Add locations, configure alert types and notification channels
- **Admin Portal**: Customer management, usage tracking, delivery logs
- **Smart Polling**: Risk-based frequency adjustment and token metering
- **Event Engine**: Normalized event processing with deduplication
- **Multi-channel Notifications**: SMS, Email, Push, In-app
