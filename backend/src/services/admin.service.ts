import { prisma } from '../utils/prisma';
import { z } from 'zod';

export const createPromoSchema = z.object({
  code: z.string().min(3).max(30).transform(s => s.toUpperCase().trim()),
  tokensGrant: z.number().int().min(1).max(99999),
  maxUses: z.number().int().min(1).nullable().optional(),
});

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tokenBalance: true,
      createdAt: true,
      _count: {
        select: {
          searches: true,
          transactions: true,
        },
      },
    },
  });

  return users;
}

export async function listPromoCodes() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { redemptions: true },
      },
    },
  });

  return promos;
}

export async function createPromoCode(data: z.infer<typeof createPromoSchema>) {
  const existing = await prisma.promoCode.findUnique({ where: { code: data.code } });
  if (existing) {
    throw new Error('Promo code already exists');
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: data.code,
      tokensGrant: data.tokensGrant,
      maxUses: data.maxUses ?? null,
    },
  });

  return promo;
}

export async function togglePromoCode(id: string, active: boolean) {
  const promo = await prisma.promoCode.update({
    where: { id },
    data: { active },
  });

  return promo;
}

export async function getAnalytics() {
  const [
    totalUsers,
    totalSearches,
    totalRevenue,
    recentSearches,
    topUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.search.count(),
    prisma.transaction.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    }),
    prisma.search.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { searches: { _count: 'desc' } },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        tokenBalance: true,
        _count: { select: { searches: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalSearches,
    totalRevenue: totalRevenue._sum.amount || 0,
    searchesLast24h: recentSearches,
    topUsers,
  };
}
