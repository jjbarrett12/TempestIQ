# Stripe setup for self-serve subscriptions

To accept credit cards and subscriptions:

1. **Create a Stripe account** at [stripe.com](https://stripe.com) and get your **Secret key** (Dashboard → Developers → API keys). Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...   # or sk_live_... for production
   ```

2. **Create products and prices** in Stripe Dashboard (Products):
   - **Starter**: $79/month recurring → copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_STARTER`
   - **Professional**: $199/month recurring → `STRIPE_PRICE_PROFESSIONAL`
   - **Business**: $399/month recurring → `STRIPE_PRICE_BUSINESS`

3. **Webhook** (so we can update plan after payment):
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/api/webhooks/stripe` (or for local testing use Stripe CLI: `stripe listen --forward-to localhost:3005/api/webhooks/stripe`)
   - Events to send: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

4. **Optional**: Set `NEXT_PUBLIC_APP_URL` in `.env` to your app URL (e.g. `http://localhost:3005`) so checkout success/cancel URLs use the correct origin.

Until Stripe is configured, signup still creates accounts; Enterprise signups get a “we’ll contact you” message, and other plans show a “billing not configured” message with a link to the dashboard.
