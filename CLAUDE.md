# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TrendyyLeads** — a commercial leads search platform with token-based monetization, Paystack payments, Google Maps integration, real-time token sync (SSE), and a local business discovery feature powered by Google Places API.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Radix UI, Lucide React
- **Auth**: JWT in HttpOnly cookie + Bearer token in `localStorage`; CSRF double-submit cookies; Google OAuth via `google-auth-library`
- **Payments**: Paystack (auto-detects local currency from browser timezone)
- **Real-time**: Server-Sent Events (`/api/realtime/token-balance`) for live token balance updates

## Commands

### Database

```bash
docker-compose up -d                        # Start PostgreSQL on port 5437
```

### Backend (`backend/`)

```bash
npm install
npx prisma migrate dev --name <name>        # Run and create a migration
npx prisma migrate deploy                   # Apply migrations (production / upgrade)
npx prisma generate                         # Regenerate Prisma client after schema change
npm run db:seed                             # Seed admin user + promo codes
npm run dev                                 # Dev server at http://localhost:3001 (tsx watch)
npm run build && npm start                  # Production build
```

### Frontend (`frontend/`)

```bash
npm install
npm run dev                                 # Dev server at http://localhost:3000
npm run build
npm run lint
```

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://trendyyleads:trendyyleads_dev@localhost:5432/trendyyleads
JWT_SECRET=
PAYSTACK_SECRET_KEY=sk_test_...
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
HUNTER_API_KEY=                 # Optional: enriches leads with real contacts from Hunter.io
GOOGLE_PLACES_API_KEY=          # Required for local business search feature
WHATSAPP_API_TOKEN=             # Optional: WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=       # Optional: WhatsApp Business phone ID
GOOGLE_CLIENT_ID=               # Required for Google OAuth login
JWT_INVALIDATE_BEFORE=          # Optional: Unix timestamp to invalidate old tokens
ALLOWED_ORIGINS=                # Optional: comma-separated extra CORS origins
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=    # Optional: enables embedded Google Maps iframes
NEXT_PUBLIC_GOOGLE_CLIENT_ID=   # Required for Google OAuth button
```

## Architecture

### Backend (`backend/src/`)

- **`server.ts`**: Express entry point. Registers security headers, CORS (origin allowlist), CSRF middleware, input sanitization, and all routers. Webhook route bypasses `express.json()` to receive raw body for HMAC verification.
- **`routes/`**: Thin handlers that validate input with Zod and delegate to services.
- **`services/leads.service.ts`**: Core lead generation logic. Search flow:
  1. Calls Clearbit autocomplete for real company names.
  2. Optionally enriches each via Hunter.io domain search for real contacts.
  3. Falls back to curated `INDUSTRIES_MAP` (27 categories) or DB `LeadTemplate` records; generates names dynamically for unknown industries.
  4. Location pool built from `LOCATIONS_MAP` (65+ cities with sub-district variants).
  5. Phone/WhatsApp numbers are generated per country format (45 countries).
  6. Results (10–20 leads) and token decrement written in a single Prisma transaction.
- **`services/places.service.ts`**: Local business search using Google Places API v1 (Text Search). Scores businesses by website presence: none=high, social-only=medium, proper site=low opportunity.
- **`services/payments.service.ts`**: Paystack checkout initialization and webhook verification (HMAC-SHA512).
- **`middleware/auth.ts`**: JWT verification; reads token from `Authorization: Bearer` header or `auth_token` cookie. Exports `requireAuth` and `requireAdmin`.
- **`middleware/csrf.ts`**: Double-submit cookie CSRF check on all state-changing routes except webhooks.
- **`utils/auditLog.ts`**: Writes admin action records that power the audit log endpoint.

### Frontend (`frontend/src/`)

- **`lib/api.ts`**: Single `request<T>()` helper that attaches `Authorization` header from `localStorage`, reads `csrf_token` from `localStorage` for mutating requests, and sends `credentials: 'include'` for the HttpOnly auth cookie.
- **`lib/auth.ts`**: Client-only helpers that read/write JWT and user object to `localStorage`. `logout()` clears both and redirects to `/login`.
- **`app/`**: Next.js App Router pages — `/` (landing), `/login`, `/register`, `/pricing`, `/dashboard` (search + history), `/dashboard/billing/success` (Paystack redirect handler), `/admin` (admin panel).
- **`components/SearchForm.tsx`**: Multi-tag industry/location input for the global leads search.
- **`components/LocalSearchForm.tsx`** + **`LocalLeadCard.tsx`**: UI for the Google Places-powered local business search, showing opportunity badges.

### Database Schema (Prisma)

Key models: `User` (tokenBalance, mustChangePassword), `Search` (query+results as JSON), `Transaction` (Paystack payments), `PromoCode` + `PromoRedemption`, `PricingTier`, `LeadTemplate` (admin-editable company lists per industry, cached 60 s in-memory).

**Premium detection**: a user is premium if they have ≥1 completed `Transaction` OR `tokenBalance >= 5`.

### Authentication Flow

1. `POST /api/auth/login` → returns JWT as `Authorization` response body; backend also sets `auth_token` HttpOnly cookie.
2. Frontend stores token in `localStorage`; `api.ts` attaches it as `Bearer` on every request.
3. CSRF token fetched from `GET /api/auth/csrf` after login; stored in `localStorage`; sent as `X-CSRF-Token` on mutations.
4. Account lockout: 5 failed logins → 15-minute lock (`failedLoginAttempts` + `lockoutUntil` on `User`).

### Next.js Version Note

This project uses **Next.js 16**, which may have breaking changes from earlier versions. Before writing Next.js-specific code, check `node_modules/next/dist/docs/` for the relevant guide. The `AGENTS.md` in `frontend/` enforces this.
