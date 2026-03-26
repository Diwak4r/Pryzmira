# Pryzmira Pro Waitlist System

## Overview
Complete waitlist system with position tracking, referral mechanics, and email notifications.

## Components Created

### 1. Database Layer (`src/lib/waitlistStore.ts`)
- PostgreSQL table with fallback to local JSON storage
- Schema:
  - `id`: Unique identifier
  - `email`: User email (unique)
  - `name`: Optional user name
  - `position`: Queue position (integer)
  - `referral_code`: 8-character alphanumeric code (unique)
  - `referred_by`: Referral code of referrer
  - `joined_at`: Timestamp
  - `status`: 'waiting' | 'invited' | 'converted'

### 2. API Routes

#### `/api/waitlist/join` (POST)
- Accepts: `{ email, name?, referredBy? }`
- Generates unique 8-char referral code
- Calculates position based on existing entries
- Implements referral mechanics: each successful referral moves referrer up 1 position
- Sends confirmation email via Resend (if configured)
- Returns: `{ position, referralCode, referralUrl }`

#### `/api/waitlist/position` (GET)
- Query param: `?email=user@example.com`
- Returns: `{ position, referralCode, referralUrl, referralCount }`

### 3. UI Components

#### `WaitlistModal` (`src/components/WaitlistModal.tsx`)
- Modal dialog with two states:
  1. **Form state**: Email + optional name input
  2. **Success state**: Shows position, referral link with copy button
- Handles referral code from URL params
- Matches Pryzmira design system

### 4. Homepage Integration (`src/views/Home.tsx`)
- Added "Join Pro Waitlist" button near builder counter
- Extracts `?ref=` param from URL for referral tracking
- Opens WaitlistModal on click

### 5. Stats Integration
- Updated `getGrowthStatsPostgres()` to query `waitlist` table
- Updated `getGrowthStatsLocal()` to read from `waitlist-store.json`
- Waitlist count now displays in homepage stats rail

## Referral Mechanics

1. User A joins waitlist → gets position #50, referral code `ABC12345`
2. User A shares `https://pryzmira.diwakaryadav.com.np/?ref=ABC12345`
3. User B clicks link and joins → User A moves from #50 to #49
4. Each successful referral moves the referrer up 1 spot

## Email Template

Professional HTML email includes:
- Position number (large, centered)
- What's included in Pro (4 bullet points)
- Referral link with copy-friendly formatting
- Call-to-action button
- Branded header and footer

## Environment Variables Required

```env
# Required for production
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Optional (email notifications)
RESEND_API_KEY=re_...

# Site URL for referral links
NEXT_PUBLIC_SITE_URL=https://pryzmira.diwakaryadav.com.np
```

## Testing Locally

1. Without Postgres: Uses `data/waitlist-store.json`
2. Without Resend: Skips email, still returns position/referral code
3. Build passes: ✓ Compiled successfully

## Deployment Checklist

- [ ] Add `RESEND_API_KEY` to Vercel env vars
- [ ] Verify `POSTGRES_URL` is set
- [ ] Test referral flow end-to-end
- [ ] Verify email delivery
- [ ] Check waitlist counter on homepage

## Files Modified/Created

**Created:**
- `src/lib/waitlistStore.ts`
- `src/app/api/waitlist/join/route.ts`
- `src/app/api/waitlist/position/route.ts`
- `src/components/WaitlistModal.tsx`

**Modified:**
- `src/views/Home.tsx` (added modal, button, referral param handling)
- `src/app/page.tsx` (wrapped in Suspense for useSearchParams)
- `src/lib/strategyStore.ts` (added waitlist table to schema, updated stats queries)
- `package.json` (added resend dependency)

## Next Steps

1. Deploy to Vercel
2. Test with real email addresses
3. Monitor waitlist growth in admin panel
4. Consider adding waitlist management UI for admin
