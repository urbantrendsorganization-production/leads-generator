import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    tokens: 10,
    description: 'Perfect for trying out the platform',
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 24.99,
    tokens: 50,
    description: 'For growing businesses',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.99,
    tokens: 150,
    description: 'For power users and agencies',
    popular: false,
  },
];

export const checkoutSchema = z.object({
  tierId: z.enum(['starter', 'growth', 'pro']),
});

export async function initializeTransaction(userId: string, tierId: string) {
  const tier = PRICING_TIERS.find(t => t.id === tierId);
  if (!tier) {
    throw new Error('Invalid pricing tier');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount: tier.price,
      tokens: tier.tokens,
      status: 'pending',
    },
  });

  // Paystack expects amount in the smallest currency unit (kobo for NGN)
  const amountInKobo = Math.round(tier.price * 100);

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      amount: amountInKobo,
      reference: transaction.id,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=success`,
      metadata: {
        transactionId: transaction.id,
        userId,
        tokens: tier.tokens,
        tierName: tier.name,
      },
    }),
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || 'Failed to initialize Paystack transaction');
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { paystackReference: data.data.reference },
  });

  return { reference: data.data.reference, url: data.data.authorization_url };
}

export async function verifyAndCreditTransaction(reference: string, userId: string) {
  const verifyResponse = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    }
  );

  const verifyData = await verifyResponse.json();

  if (!verifyData.status || verifyData.data.status !== 'success') {
    throw new Error('Payment not confirmed by Paystack');
  }

  const transactionId = verifyData.data.metadata?.transactionId || reference;

  // Find pending transaction — scoped to this user to prevent cross-user abuse
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId, status: 'pending' },
  });

  if (!transaction) {
    // Already credited or doesn't belong to this user — return current balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { alreadyCredited: true, tokenBalance: user?.tokenBalance ?? 0 };
  }

  // Credit tokens idempotently
  const [, updatedUser] = await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'completed' },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { tokenBalance: { increment: transaction.tokens } },
    }),
  ]);

  return { alreadyCredited: false, tokenBalance: updatedUser.tokenBalance };
}

export async function handleWebhook(payload: Buffer, signature: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error('Paystack secret key not configured');
  }

  // Verify webhook signature using HMAC-SHA512
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');

  if (hash !== signature) {
    throw new Error('Invalid webhook signature');
  }

  const event = JSON.parse(payload.toString());

  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data;
    const transactionId = metadata?.transactionId || reference;
    const userId = metadata?.userId;
    const tokens = metadata?.tokens;

    if (transactionId && userId && tokens) {
      // Verify the transaction with Paystack before crediting
      const verifyResponse = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();

      if (verifyData.status && verifyData.data.status === 'success') {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'completed' },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { tokenBalance: { increment: parseInt(String(tokens)) } },
          }),
        ]);
      }
    }
  }

  return { received: true };
}
