# How to Get API Keys & Credentials

This guide walks you through obtaining all the API keys and credentials needed for Roof Alert.

## 1. Xweather API Key 🔥 (Required)

**What it's for:** Weather data (alerts, hail threats, tornado warnings)

### Steps:
1. **Visit:** https://www.aerisweather.com/ (Xweather is part of AerisWeather)
2. **Sign up** for an account
3. **Choose a plan:**
   - **Free tier:** Limited requests (good for testing)
   - **Paid plans:** Higher limits, webhook access
4. **Get your API key:**
   - Go to Dashboard → API Keys
   - Copy your **Client ID** and **Client Secret**
   - Or use a single **API Key** if provided

### In your `.env` file:
```bash
XWEATHER_API_KEY="your-api-key-here"
XWEATHER_BASE_URL="https://api.xweather.com"
```

**Note:** For webhook access (recommended), you'll need a paid plan. Check their documentation for webhook setup.

---

## 2. Twilio Account (SMS) 📱 (Required)

**What it's for:** Sending SMS alerts to customers

### Steps:
1. **Visit:** https://www.twilio.com/
2. **Sign up** for a free account (includes $15 credit)
3. **Verify your phone number** (for testing)
4. **Get your credentials:**
   - Go to Console Dashboard
   - Find **Account SID** (starts with `AC...`)
   - Find **Auth Token** (click to reveal)
5. **Get a phone number:**
   - Go to Phone Numbers → Buy a Number
   - Choose a number (free trial includes one)
   - Copy the phone number (format: `+1234567890`)

### In your `.env` file:
```bash
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token-here"
TWILIO_PHONE_NUMBER="+1234567890"
```

**Cost:** ~$0.0075 per SMS (very affordable)

---

## 3. SendGrid Account (Email) 📧 (Required)

**What it's for:** Sending email alerts to customers

### Steps:
1. **Visit:** https://sendgrid.com/
2. **Sign up** for a free account (100 emails/day free)
3. **Verify your email** address
4. **Create an API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it (e.g., "Roof Alert")
   - Choose "Full Access" or "Restricted Access" (Mail Send)
   - **Copy the key immediately** (you won't see it again!)
5. **Verify sender domain** (for production):
   - Go to Settings → Sender Authentication
   - Add your domain (or use single sender verification for testing)

### In your `.env` file:
```bash
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="alerts@yourdomain.com"
```

**Note:** For testing, you can use any email. For production, verify your domain.

---

## 4. PostgreSQL Database 🗄️ (Required)

**What it's for:** Storing customers, assets, events, notifications

### Option A: Local PostgreSQL (Free)

**macOS:**
```bash
brew install postgresql
brew services start postgresql
createdb roofalert
```

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install PostgreSQL
- Create database using pgAdmin or command line

**Linux:**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb roofalert
```

### Option B: Cloud Database (Recommended for Production)

**Supabase (Free tier available):**
1. Visit: https://supabase.com/
2. Sign up for free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string

**Railway (Free tier available):**
1. Visit: https://railway.app/
2. Sign up with GitHub
3. Create PostgreSQL database
4. Copy connection string from Variables tab

**Other options:**
- **Neon** (https://neon.tech/) - Serverless Postgres
- **Render** (https://render.com/) - Free tier available
- **AWS RDS** - Paid but scalable

### In your `.env` file:
```bash
# Local example
DATABASE_URL="postgresql://username:password@localhost:5432/roofalert"

# Supabase example
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"

# Railway example
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

---

## 5. Redis (Queue) 🔴 (Required)

**What it's for:** Background job queue for workers

### Option A: Local Redis (Free)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Windows:**
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use WSL: `sudo apt-get install redis-server`

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### Option B: Cloud Redis (Recommended for Production)

**Upstash (Free tier available):**
1. Visit: https://upstash.com/
2. Sign up for free account
3. Create Redis database
4. Copy REST URL or Redis URL

**Redis Cloud (Free tier available):**
1. Visit: https://redis.com/try-free/
2. Sign up
3. Create database
4. Copy connection string

**Railway:**
1. Visit: https://railway.app/
2. Add Redis service
3. Copy connection URL

### In your `.env` file:
```bash
# Local example
REDIS_URL="redis://localhost:6379"

# Upstash example
REDIS_URL="redis://default:password@xxxxx.upstash.io:6379"

# Redis Cloud example
REDIS_URL="redis://default:password@xxxxx.redis.cloud.redislabs.com:12345"
```

---

## 6. NextAuth Secret (For Future Auth) 🔐

**What it's for:** Session encryption (when you add authentication)

### Generate a random secret:
```bash
# Using OpenSSL
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use online generator
# https://generate-secret.vercel.app/32
```

### In your `.env` file:
```bash
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Complete `.env` Template

Once you have all credentials, your `.env` file should look like:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Xweather API
XWEATHER_API_KEY="your-xweather-key"
XWEATHER_BASE_URL="https://api.xweather.com"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid (Email)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="alerts@yourdomain.com"

# Redis (Queue)
REDIS_URL="redis://localhost:6379"

# Next.js
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NODE_ENV="development"
```

---

## Cost Summary

### Free Tier Options:
- ✅ **Xweather:** Free tier available (limited requests)
- ✅ **Twilio:** $15 free credit (good for testing)
- ✅ **SendGrid:** 100 emails/day free forever
- ✅ **PostgreSQL:** Free on Supabase/Railway/Neon
- ✅ **Redis:** Free on Upstash/Redis Cloud

### Estimated Monthly Costs (Small Scale):
- Xweather: $0-50/month (depending on usage)
- Twilio: ~$5-20/month (for SMS)
- SendGrid: $0-15/month (free tier covers most)
- Database: $0-20/month (free tiers available)
- Redis: $0-10/month (free tiers available)

**Total:** ~$5-100/month depending on usage

---

## Testing Without All APIs

You can start testing with minimal setup:

1. **Database:** Required (use Supabase free tier)
2. **Redis:** Required (use Upstash free tier)
3. **Xweather:** Can mock responses for testing
4. **Twilio:** Can skip SMS for initial testing
5. **SendGrid:** Can skip email for initial testing

The platform will work without Twilio/SendGrid, but notifications won't send.

---

## Security Best Practices

1. **Never commit `.env` to git** (already in `.gitignore`)
2. **Use environment variables** in production
3. **Rotate API keys** periodically
4. **Use restricted API keys** when possible (SendGrid)
5. **Enable 2FA** on all accounts
6. **Monitor usage** to detect abuse

---

## Need Help?

- **Xweather Docs:** https://www.aerisweather.com/support/docs/
- **Twilio Docs:** https://www.twilio.com/docs
- **SendGrid Docs:** https://docs.sendgrid.com/
- **Prisma Docs:** https://www.prisma.io/docs

---

## Quick Setup Checklist

- [ ] Xweather account created, API key obtained
- [ ] Twilio account created, credentials obtained
- [ ] SendGrid account created, API key obtained
- [ ] PostgreSQL database set up (local or cloud)
- [ ] Redis set up (local or cloud)
- [ ] All credentials added to `.env` file
- [ ] Tested database connection
- [ ] Tested Redis connection

Once you have all these, you're ready to run `npm run db:migrate` and start the platform!
