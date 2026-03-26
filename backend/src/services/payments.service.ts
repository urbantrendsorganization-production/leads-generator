import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const EXCHANGE_RATE_FALLBACK = 1700; // NGN per USD

// Static fallback — used only if DB returns no active tiers
export const PRICING_TIERS_FALLBACK = [
  { id: 'starter', tierId: 'starter', name: 'Starter', price: 9.99,  tokens: 10,  description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth',  tierId: 'growth',  name: 'Growth',  price: 24.99, tokens: 50,  description: 'For growing businesses',              popular: true  },
  { id: 'pro',     tierId: 'pro',     name: 'Pro',     price: 49.99, tokens: 150, description: 'For power users and agencies',        popular: false },
];

/** Fetch active pricing tiers from DB, fall back to hardcoded if empty */
export async function getPricingTiers() {
  const dbTiers = await prisma.pricingTier.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  });
  if (dbTiers.length > 0) {
    return dbTiers.map((t: any) => ({
      id: t.tierId,
      tierId: t.tierId,
      name: t.name,
      price: t.price,
      tokens: t.tokens,
      description: t.description,
      popular: t.popular,
    }));
  }
  return PRICING_TIERS_FALLBACK;
}

export const checkoutSchema = z.object({
  tierId: z.string().min(1),
});

// ─── helpers ─────────────────────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface RateInfo {
  currency: string; // ISO-4217 e.g. "NGN"
  rate: number;     // units per 1 USD
  source: 'live' | 'fallback';
}

// Timezone → currency map (mirrors frontend utility)
const TIMEZONE_CURRENCY: Record<string, string> = {
  'Africa/Lagos': 'NGN', 'Africa/Abuja': 'NGN', 'Africa/Accra': 'GHS',
  'Africa/Nairobi': 'KES', 'Africa/Johannesburg': 'ZAR', 'Africa/Cairo': 'EGP',
  'Africa/Casablanca': 'MAD', 'Africa/Kampala': 'UGX', 'Africa/Dar_es_Salaam': 'TZS',
  'Africa/Kigali': 'RWF', 'Africa/Addis_Ababa': 'ETB', 'Africa/Douala': 'XAF',
  'Africa/Dakar': 'XOF', 'Africa/Abidjan': 'XOF', 'Africa/Luanda': 'AOA',
  'Africa/Lusaka': 'ZMW', 'Africa/Harare': 'ZWL', 'Africa/Maputo': 'MZN',
  'Europe/London': 'GBP', 'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR',
  'Europe/Rome': 'EUR', 'Europe/Madrid': 'EUR', 'Europe/Amsterdam': 'EUR',
  'Europe/Warsaw': 'PLN', 'Europe/Stockholm': 'SEK', 'Europe/Oslo': 'NOK',
  'Europe/Copenhagen': 'DKK', 'Europe/Zurich': 'CHF', 'Europe/Moscow': 'RUB',
  'Europe/Istanbul': 'TRY',
  'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Los_Angeles': 'USD',
  'America/Toronto': 'CAD', 'America/Vancouver': 'CAD', 'America/Sao_Paulo': 'BRL',
  'America/Mexico_City': 'MXN', 'America/Bogota': 'COP', 'America/Lima': 'PEN',
  'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Kolkata': 'INR',
  'Asia/Dhaka': 'BDT', 'Asia/Karachi': 'PKR', 'Asia/Shanghai': 'CNY',
  'Asia/Tokyo': 'JPY', 'Asia/Seoul': 'KRW', 'Asia/Singapore': 'SGD',
  'Asia/Hong_Kong': 'HKD', 'Asia/Bangkok': 'THB', 'Asia/Jakarta': 'IDR',
  'Asia/Manila': 'PHP', 'Asia/Kuala_Lumpur': 'MYR',
  'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Australia/Perth': 'AUD',
  'Pacific/Auckland': 'NZD',
};

function getCurrencyFromTimezone(tz: string): string | null {
  return TIMEZONE_CURRENCY[tz] ?? null;
}

/** Fallback currency detection when no timezone is provided */
function detectCurrencyFromIp(_ip: string): string {
  return 'NGN'; // safe default — timezone from browser is always preferred
}

/** Fetch live USD → target-currency exchange rate */
async function getExchangeRate(targetCurrency: string): Promise<RateInfo> {
  try {
    const res = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD', {}, 5000);
    if (res.ok) {
      const data = await res.json() as any;
      const rate = data?.rates?.[targetCurrency];
      if (typeof rate === 'number' && rate > 0) {
        console.log(`[payments] USD/${targetCurrency} rate: ${rate} (live)`);
        return { currency: targetCurrency, rate, source: 'live' };
      }
    }
  } catch { /* ignore */ }
  console.log(`[payments] USD/${targetCurrency} rate: fallback NGN ${EXCHANGE_RATE_FALLBACK}`);
  return { currency: 'NGN', rate: EXCHANGE_RATE_FALLBACK, source: 'fallback' };
}

/**
 * Try to initialize a Paystack transaction with the given currency.
 * Returns null if Paystack rejects the currency (not supported by merchant).
 */
async function paystackInit(body: Record<string, unknown>): Promise<any | null> {
  const res = await fetchWithTimeout(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json() as any;
  if (!data.status) {
    const msg: string = (data.message ?? '').toLowerCase();
    if (msg.includes('currency') && msg.includes('supported')) return null; // signal caller to retry
    throw new Error(data.message || 'Failed to initialize Paystack transaction');
  }
  return data;
}

// ─── public API ──────────────────────────────────────────────────────────────

/**
 * Initialize a Paystack transaction.
 * @param clientIp  — forwarded client IP so we can detect their currency.
 */
export async function initializeTransaction(
  userId: string,
  tierId: string,
  clientIp: string,
  timezone?: string,
) {
  const tiers = await getPricingTiers();
  const tier = tiers.find(t => t.id === tierId);
  if (!tier) throw new Error('Invalid pricing tier');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // 1. Detect currency — timezone (most reliable) → IP fallback
  const tzCurrency = timezone ? getCurrencyFromTimezone(timezone) : null;
  const detectedCurrency = tzCurrency ?? await detectCurrencyFromIp(clientIp);
  console.log(`[payments] detected currency: ${detectedCurrency} (tz=${timezone ?? 'none'}, ip=${clientIp})`);

  // 2. Get live exchange rate for that currency (falls back to NGN if unknown)
  const rateInfo = await getExchangeRate(detectedCurrency);

  const amountLocal  = Math.round(tier.price * rateInfo.rate); // e.g. 16983
  const amountSmallest = amountLocal * 100;                    // Paystack smallest unit

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount: amountLocal,
      tokens: tier.tokens,
      status: 'pending',
    },
  });

  const baseBody = {
    email: user.email,
    amount: amountSmallest,
    reference: transaction.id,
    callback_url: `${process.env.FRONTEND_URL || 'https://trendyyleads.com'}/dashboard/billing/success`,
    metadata: {
      transactionId: transaction.id,
      userId,
      tokens: tier.tokens,
      tierName: tier.name,
      clientCurrency: rateInfo.currency,
    },
  };

  // 3. Try with detected currency first, then fall back to account default (no currency field)
  let data = await paystackInit({ ...baseBody, currency: rateInfo.currency });

  if (!data) {
    console.log(`[payments] ${rateInfo.currency} not supported — retrying with account default`);
    data = await paystackInit(baseBody); // no currency → Paystack uses merchant default
    if (!data) {
      await prisma.transaction.delete({ where: { id: transaction.id } });
      throw new Error('Payment initialization failed. Please try again.');
    }
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { paystackReference: data.data.reference },
  });

  return { reference: data.data.reference, url: data.data.authorization_url };
}

export async function verifyAndCreditTransaction(reference: string, userId: string) {
  const verifyResponse = await fetchWithTimeout(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
  );

  const verifyData = await verifyResponse.json() as any;

  if (!verifyData.status || verifyData.data.status !== 'success') {
    throw new Error('Payment not confirmed by Paystack');
  }

  const transactionId = verifyData.data.metadata?.transactionId;

  const transaction = await prisma.transaction.findFirst({
    where: {
      userId,
      status: 'pending',
      OR: [
        ...(transactionId ? [{ id: transactionId as string }] : []),
        { paystackReference: reference },
      ],
    },
  });

  if (!transaction) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { alreadyCredited: true, tokenBalance: user?.tokenBalance ?? 0 };
  }

  const [, updatedUser] = await prisma.$transaction([
    prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'completed' } }),
    prisma.user.update({ where: { id: userId }, data: { tokenBalance: { increment: transaction.tokens } } }),
  ]);

  return { alreadyCredited: false, tokenBalance: updatedUser.tokenBalance };
}

export async function handleWebhook(payload: Buffer, signature: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('Paystack secret key not configured');

  const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
  if (hash !== signature) throw new Error('Invalid webhook signature');

  const event = JSON.parse(payload.toString());

  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data;
    const transactionId = metadata?.transactionId;
    const userId        = metadata?.userId;
    const tokens        = metadata?.tokens;

    if (userId && tokens) {
      const verifyResponse = await fetchWithTimeout(
        `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
      );
      const verifyData = await verifyResponse.json() as any;

      if (verifyData.status && verifyData.data.status === 'success') {
        const transaction = await prisma.transaction.findFirst({
          where: {
            userId,
            status: 'pending',
            OR: [
              ...(transactionId ? [{ id: transactionId as string }] : []),
              { paystackReference: reference },
            ],
          },
        });

        if (!transaction) return { received: true }; // already credited

        await prisma.$transaction([
          prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'completed' } }),
          prisma.user.update({ where: { id: userId }, data: { tokenBalance: { increment: parseInt(String(tokens)) } } }),
        ]);
      }
    }
  }

  return { received: true };
}
