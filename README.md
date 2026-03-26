# TrendyyLeads

A commercial leads search platform with elegant UI, token-based monetization, and Paystack payments.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Radix UI
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Payments**: Paystack
- **Auth**: JWT-based (register/login)

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

## Default Accounts

After seeding:

- **Admin**: `admin@trendyyleads.com` / `admin123`

## Promo Codes (Seeded)

- `URBANPARTNER2024` - Grants 9999 tokens (unlimited use)
- `WELCOME50` - Grants 50 tokens (max 100 uses)

## How It Works

1. Users register and receive **1 free search token**
2. Each search costs **1 token** and returns 5-10 realistic lead results
3. When tokens run out, users purchase more via **Paystack**
4. **Promo codes** can grant tokens for partnerships and promotions

## Pricing Tiers

| Plan    | Price  | Searches |
|---------|--------|----------|
| Starter | $9.99  | 10       |
| Growth  | $24.99 | 50       |
| Pro     | $49.99 | 150      |

## API Endpoints

| Method | Endpoint                | Auth      | Description                      |
|--------|-------------------------|-----------|----------------------------------|
| POST   | /api/auth/register      | Public    | Create account (1 free token)    |
| POST   | /api/auth/login         | Public    | Get JWT token                    |
| GET    | /api/auth/me            | Required  | Current user info                |
| POST   | /api/leads/search       | Required  | Search leads (costs 1 token)     |
| GET    | /api/leads/history      | Required  | User search history              |
| POST   | /api/promos/redeem      | Required  | Redeem promo code                |
| GET    | /api/pricing            | Public    | Get pricing tiers                |
| POST   | /api/payments/checkout  | Required  | Initialize Paystack transaction  |
| POST   | /api/payments/webhook   | Paystack  | Handle Paystack webhook          |
| GET    | /api/admin/users        | Admin     | List all users                   |
| POST   | /api/admin/promos       | Admin     | Create promo code                |
| GET    | /api/admin/promos       | Admin     | List promo codes                 |
| PATCH  | /api/admin/promos/:id   | Admin     | Toggle promo code status         |
| GET    | /api/admin/analytics    | Admin     | Dashboard statistics             |

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://trendyyleads:trendyyleads_dev@localhost:5432/trendyyleads
JWT_SECRET=your-secret-key
PAYSTACK_SECRET_KEY=sk_test_...
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
```

## Paystack Setup

1. Create a Paystack account at https://paystack.com
2. Get your test API keys from the Paystack Dashboard (Settings > API Keys & Webhooks)
3. Set `PAYSTACK_SECRET_KEY` in backend `.env`
4. Set `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` in frontend `.env.local`
5. For webhooks, configure your webhook URL in the Paystack Dashboard to point to `https://your-domain/api/payments/webhook`
6. In production, whitelist Paystack's IP addresses (52.31.139.75, 52.49.173.169, 52.214.14.220) for the webhook endpoint

## Project Structure

```
leads-generator/
  backend/
    src/
      routes/        # Express route handlers
      services/      # Business logic
      middleware/     # Auth guards, rate limiting
      utils/         # Helpers (Prisma client, JWT)
    prisma/          # Schema and seed
    server.ts
  frontend/
    src/
      app/           # Next.js App Router pages
      components/    # React components
      lib/           # API client, auth helpers, utils
  docker-compose.yml
```
