# Marketing Website Guide

## Overview

A professional marketing website has been added to the Roof Alert platform. The website includes:

- **Landing Page** (`/marketing`) - Full marketing site
- **Signup Page** (`/signup`) - Customer registration
- **Homepage Redirect** (`/`) - Redirects to marketing page

## Pages Created

### 1. Marketing Landing Page (`/marketing`)

**Sections:**
- **Hero Section** - Eye-catching headline with CTAs
- **Features Section** - 6 key features with icons
- **How It Works** - 3-step process explanation
- **Pricing Section** - 3 pricing tiers (Starter, Professional, Enterprise)
- **Testimonials** - Customer testimonials
- **CTA Section** - Final call-to-action
- **Footer** - Links, contact info, company info

**Design Features:**
- Modern gradient backgrounds
- Responsive design (mobile-friendly)
- Professional color scheme (blue/indigo)
- Smooth hover effects
- Sticky navigation header

### 2. Signup Page (`/signup`)

**Features:**
- Clean signup form
- Form validation
- Success state
- Link back to marketing site
- "Sign in" link for existing users

**Form Fields:**
- Full Name (required)
- Email (required)
- Phone Number (optional)
- Company (optional)

### 3. Homepage (`/`)

- Redirects to `/marketing` for better SEO and user experience

## Customization

### Update Colors

Edit the Tailwind classes in `src/app/marketing/page.tsx`:
- Primary: `bg-blue-600`, `text-blue-600`
- Secondary: `bg-indigo-600`
- Accent: `bg-purple-50`

### Update Content

**Company Info:**
- Edit footer contact information
- Update email/phone numbers
- Modify company description

**Pricing:**
- Update prices in pricing section
- Modify plan features
- Add/remove plans

**Testimonials:**
- Replace with real customer testimonials
- Add more testimonials
- Include customer photos/logos

### Add New Sections

Common sections to add:
- **About Us** - Company story
- **Blog** - Weather news/articles
- **Case Studies** - Success stories
- **FAQ** - Frequently asked questions
- **Integrations** - Partner integrations
- **Resources** - Documentation, guides

## SEO Optimization

### Meta Tags

Add to `src/app/marketing/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roof Alert - Severe Weather Protection for Your Properties',
  description: 'Real-time alerts for hail, tornado, and extreme wind events. Protect your properties with instant SMS, email, and push notifications.',
  keywords: 'weather alerts, hail protection, tornado warning, severe weather, property protection',
}
```

### Open Graph Tags

Add social media preview images:

```tsx
export const metadata: Metadata = {
  openGraph: {
    title: 'Roof Alert - Severe Weather Protection',
    description: 'Real-time alerts for severe weather events',
    images: ['/og-image.png'],
  },
}
```

## Analytics

### Google Analytics

Add to `src/app/layout.tsx`:

```tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Contact Form Integration

The contact form endpoint is ready at `/api/contact`. To make it functional:

1. **Add Email Sending:**
   - Use SendGrid to send emails
   - Or save to database for admin review

2. **Add Form to Marketing Page:**
   - Create contact form component
   - Add to footer or separate contact page

## Performance Optimization

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="Roof Alert"
  width={1200}
  height={600}
  priority
/>
```

### Font Optimization

Add custom fonts in `src/app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

## A/B Testing

Consider testing:
- Headline variations
- CTA button colors/text
- Pricing display
- Feature order

## Conversion Tracking

### Track Signups

Add event tracking to signup form:

```tsx
// In signup page
const handleSubmit = async () => {
  // Track conversion
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'signup', {
      event_category: 'engagement',
      event_label: 'signup_form',
    })
  }
}
```

## Mobile Optimization

The site is responsive, but verify:
- Touch targets are large enough (44x44px minimum)
- Forms are easy to fill on mobile
- CTAs are prominent on small screens
- Navigation is accessible

## Accessibility

Ensure:
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images
- ARIA labels where needed
- Keyboard navigation works
- Color contrast meets WCAG AA

## Next Steps

1. **Add Real Content:**
   - Replace placeholder text
   - Add real testimonials
   - Update contact information

2. **Connect Signup:**
   - Link signup form to actual registration
   - Add email verification
   - Create customer account

3. **Add Analytics:**
   - Set up Google Analytics
   - Track conversions
   - Monitor user behavior

4. **SEO:**
   - Add meta tags
   - Create sitemap.xml
   - Submit to search engines

5. **Performance:**
   - Optimize images
   - Add caching
   - Minimize bundle size

## Files Created

- `src/app/marketing/page.tsx` - Main marketing page
- `src/app/signup/page.tsx` - Signup page
- `src/app/api/contact/route.ts` - Contact form API
- `src/components/marketing/Testimonial.tsx` - Testimonial component

## Preview

Visit `http://localhost:3005/marketing` to see the marketing site!
