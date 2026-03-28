# TrendyyLeads

A commercial leads search platform with elegant dark UI, token-based monetization, Paystack payments, WhatsApp contact discovery, Google Maps integration, and real-time synchronization.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Radix UI, Lucide React
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Server-Sent Events
- **Database**: PostgreSQL
- **Payments**: Paystack (with local currency auto-detection)
- **Auth**: JWT (HttpOnly cookie + Bearer token), CSRF protection
- **External Services**: Clearbit (company autocomplete), Google Maps (deep-links + optional embed)

## Quick Start

### 1. Start the database

```bash
docker-compose up -d
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values (DATABASE_URL is pre-filled for Docker)
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed    # Creates admin user and sample promo codes
npm run dev
```

The API will be running at `http://localhost:3001`.

### 3. Set up the frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local if needed
npm install
npm run dev
```

The app will be running at `http://localhost:3000`.

### 4. Apply database migrations (after first setup)

If you are upgrading an existing deployment, apply new migrations:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Default Accounts

After seeding:

- **Admin**: `admin@trendyyleads.com` / `admin123`

> Admin accounts created by another admin will have `mustChangePassword` set — the user will be prompted to update their password on first login.

## Promo Codes (Seeded)

- `URBANPARTNER2024` — Grants 9999 tokens (unlimited uses)
- `WELCOME50` — Grants 50 tokens (max 100 uses)

## How It Works

1. Users register and receive **1 free search token**
2. Each search costs **1 token** and returns 5–10 realistic lead results including email, phone, WhatsApp number, and a Google Maps link
3. **WhatsApp contacts** are unlocked for premium users (those who have purchased tokens or hold ≥ 5 tokens)
4. When tokens run out, users purchase more via **Paystack** (auto-detects local currency from timezone)
5. **Promo codes** can grant tokens for partnerships and promotions
6. **Token balance syncs in real-time** via Server-Sent Events — no page refresh needed

## Search Features

- **Multi-tag industry input** — add up to 5 industry tags (e.g. `technology`, `healthcare`, `finance`) in one search
- **Multi-tag location input** — add up to 5 location tags (e.g. `Lagos`, `London`, `New York`) in one search
- **Company size filter** — 1-10, 11-50, 51-200, 201-500, 500+
- **Keywords** — free-text search terms
- **Google Maps** — view each lead's location on Google Maps; optional embedded map when a location is provided

## Premium Features

| Feature                   | Free | Premium |
|---------------------------|------|---------|
| Lead search (email, phone) | Yes  | Yes     |
| WhatsApp number           | Locked | Unlocked |
| Google Maps link per lead | Yes  | Yes     |
| CSV export                | Yes  | Yes (includes WhatsApp) |
| Real-time token sync      | Yes  | Yes     |

A user is considered **premium** when they have at least one completed payment transaction OR a token balance ≥ 5.

## Pricing Tiers

| Plan    | Price  | Searches |
|---------|--------|----------|
| Starter | $9.99  | 10       |
| Growth  | $24.99 | 50       |
| Pro     | $49.99 | 150      |

## API Endpoints

| Method | Endpoint                        | Auth      | Description                                     |
|--------|---------------------------------|-----------|-------------------------------------------------|
| POST   | /api/auth/register              | Public    | Create account (1 free token)                   |
| POST   | /api/auth/login                 | Public    | Get JWT (sets HttpOnly cookie + returns token)  |
| GET    | /api/auth/me                    | Required  | Current user info + isPremium + mustChangePassword |
| GET    | /api/auth/csrf                  | Public    | Get CSRF token (double-submit cookie pattern)   |
| POST   | /api/leads/search               | Required  | Search leads — accepts industries[] + locations[] |
| GET    | /api/leads/history              | Required  | User search history (last 50)                   |
| GET    | /api/realtime/token-balance     | Required  | SSE stream for real-time token balance updates  |
| POST   | /api/promos/redeem              | Required  | Redeem promo code                               |
| GET    | /api/pricing                    | Public    | Get pricing tiers                               |
| POST   | /api/payments/checkout          | Required  | Initialize Paystack transaction                 |
| POST   | /api/payments/verify            | Required  | Verify payment & credit tokens                  |
| POST   | /api/payments/webhook           | Paystack  | Handle Paystack charge.success webhook          |
| GET    | /api/admin/users                | Admin     | List all users                                  |
| POST   | /api/admin/users                | Admin     | Create staff/admin account                      |
| PATCH  | /api/admin/users/:id            | Admin     | Update user role or token balance               |
| DELETE | /api/admin/users/:id            | Admin     | Delete user                                     |
| POST   | /api/admin/users/:id/reset-password | Admin | Reset user password (sets mustChangePassword)   |
| POST   | /api/admin/promos               | Admin     | Create promo code                               |
| GET    | /api/admin/promos               | Admin     | List promo codes                                |
| PATCH  | /api/admin/promos/:id           | Admin     | Toggle promo code status                        |
| GET    | /api/admin/pricing              | Admin     | List pricing tiers                              |
| POST   | /api/admin/pricing              | Admin     | Create pricing tier                             |
| PATCH  | /api/admin/pricing/:tierId      | Admin     | Update pricing tier                             |
| GET    | /api/admin/lead-templates       | Admin     | List industry lead templates                    |
| PUT    | /api/admin/lead-templates/:industry | Admin | Upsert lead template for industry           |
| GET    | /api/admin/analytics            | Admin     | Dashboard statistics                            |
| GET    | /api/admin/audit-log            | Admin     | Recent admin actions                            |
| GET    | /api/health                     | Public    | Health check                                    |

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://trendyyleads:trendyyleads_dev@localhost:5432/trendyyleads
JWT_SECRET=your-secret-key
PAYSTACK_SECRET_KEY=sk_test_...
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
# Optional: invalidate all tokens issued before this Unix timestamp
JWT_INVALIDATE_BEFORE=
# Optional: comma-separated additional CORS origins
ALLOWED_ORIGINS=
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
# Optional: enables embedded Google Maps iframes in search results
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

## Security

- **JWT auth** stored in HttpOnly cookie (SameSite=Strict) — prevents XSS token theft
- **CSRF protection** via double-submit cookie on all state-changing routes
- **Account lockout** — 5 failed login attempts locks the account for 15 minutes
- **Rate limiting** — per-route limits (auth: 10/min, search: 20/min, admin: 60/min)
- **Input sanitization** — HTML escaping + prototype pollution prevention on all inputs
- **Zod validation** on all request bodies
- **Content Security Policy** header restricting script, style, frame, and connect sources
- **Request ID tracking** (`X-Request-Id` header) for log correlation
- **Paystack webhook** verified via HMAC-SHA512 signature
- **mustChangePassword** flag forces password reset after admin-initiated resets
- **Prisma ORM** prevents SQL injection via parameterized queries

## Paystack Setup

1. Create a Paystack account at https://paystack.com
2. Get your test API keys from the Paystack Dashboard (Settings > API Keys & Webhooks)
3. Set `PAYSTACK_SECRET_KEY` in backend `.env`
4. Set `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` in frontend `.env.local`
5. For webhooks, configure your webhook URL in the Paystack Dashboard to point to `https://your-domain/api/payments/webhook`
6. In production, whitelist Paystack's IP addresses: `52.31.139.75`, `52.49.173.169`, `52.214.14.220`

## Google Maps Setup (Optional)

Without a key, each lead card shows a "View on Google Maps" deep-link that opens the company location in a new tab — no key required.

To enable embedded map iframes in search results:
1. Enable the **Maps Embed API** in Google Cloud Console
2. Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-key` in frontend `.env.local`

## Project Structure

```
leads-generator/
  backend/
    src/
      routes/         # Express route handlers (auth, leads, payments, realtime, admin)
      services/       # Business logic (leads, auth, payments, promos, admin)
      middleware/     # Auth guards, CSRF, rate limiting, sanitization
      utils/          # Prisma client, JWT helpers, audit log
    prisma/
      schema.prisma   # Database schema
      migrations/     # Migration history
      seed.ts         # Initial data
  frontend/
    src/
      app/            # Next.js App Router pages (landing, dashboard, login, register, admin)
      components/     # React components (SearchForm, LeadCard, TokenBadge, Navbar, ...)
      lib/            # API client, auth helpers, currency utils
    public/           # Static assets
  docker-compose.yml
```
