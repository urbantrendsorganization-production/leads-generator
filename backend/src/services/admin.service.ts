import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { auditLog } from '../utils/auditLog';
import { z } from 'zod';
import { passwordSchema } from './auth.service';

export const createPromoSchema = z.object({
  code: z.string().min(3).max(30).transform(s => s.toUpperCase().trim()),
  tokensGrant: z.number().int().min(1).max(99999),
  maxUses: z.number().int().min(1).nullable().optional(),
});

// ─── Users ──────────────────────────────────────────────────────────────────

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

export async function createStaff(
  adminEmail: string,
  data: { email: string; name?: string; role: string },
) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  const tempPassword = crypto.randomBytes(6).toString('base64url');

  // Validate temp password meets policy — if not, append defaults
  let password = tempPassword;
  if (!/[a-z]/.test(password)) password += 'a';
  if (!/[A-Z]/.test(password)) password += 'A';
  if (!/\d/.test(password)) password += '1';

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name || null,
      passwordHash,
      role: data.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
      tokenBalance: 1,
    },
  });

  auditLog.record(adminEmail, 'CREATE_STAFF', data.email, `role=${data.role}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenBalance: user.tokenBalance,
    },
    tempPassword: password,
  };
}

export async function updateUserRole(adminEmail: string, userId: string, role: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: role === 'ADMIN' ? 'ADMIN' : 'CLIENT' },
  });
  auditLog.record(adminEmail, 'UPDATE_USER_ROLE', user.email, `role=${role}`);
  return user;
}

export async function updateUserTokens(adminEmail: string, userId: string, tokenBalance: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { tokenBalance },
  });
  auditLog.record(adminEmail, 'UPDATE_USER_TOKENS', user.email, `tokens=${tokenBalance}`);
  return user;
}

export async function deleteUser(adminEmail: string, userId: string, currentUserId: string) {
  if (userId === currentUserId) {
    throw new Error('Cannot delete your own account');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Delete related records first
  await prisma.$transaction([
    prisma.promoRedemption.deleteMany({ where: { userId } }),
    prisma.search.deleteMany({ where: { userId } }),
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  auditLog.record(adminEmail, 'DELETE_USER', user.email, '');
  return { deleted: true };
}

export async function resetUserPassword(adminEmail: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  let tempPassword = crypto.randomBytes(6).toString('base64url');
  if (!/[a-z]/.test(tempPassword)) tempPassword += 'a';
  if (!/[A-Z]/.test(tempPassword)) tempPassword += 'A';
  if (!/\d/.test(tempPassword)) tempPassword += '1';

  const passwordHash = await bcrypt.hash(tempPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  auditLog.record(adminEmail, 'RESET_PASSWORD', user.email, '');
  return { tempPassword };
}

// ─── Promo Codes ────────────────────────────────────────────────────────────

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

export async function createPromoCode(adminEmail: string, data: z.infer<typeof createPromoSchema>) {
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

  auditLog.record(adminEmail, 'CREATE_PROMO', data.code, `tokens=${data.tokensGrant}`);
  return promo;
}

export async function togglePromoCode(adminEmail: string, id: string, active: boolean) {
  const promo = await prisma.promoCode.update({
    where: { id },
    data: { active },
  });

  auditLog.record(adminEmail, 'TOGGLE_PROMO', promo.code, `active=${active}`);
  return promo;
}

// ─── Pricing Tiers ──────────────────────────────────────────────────────────

export async function listPricingTiers() {
  const tiers = await prisma.pricingTier.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return tiers;
}

export async function updatePricingTier(
  adminEmail: string,
  tierId: string,
  data: {
    name?: string;
    price?: number;
    tokens?: number;
    description?: string;
    popular?: boolean;
    active?: boolean;
    sortOrder?: number;
  },
) {
  const tier = await prisma.pricingTier.update({
    where: { tierId },
    data,
  });
  auditLog.record(adminEmail, 'UPDATE_PRICING_TIER', tierId, JSON.stringify(data));
  return tier;
}

export async function createPricingTier(
  adminEmail: string,
  data: {
    tierId: string;
    name: string;
    price: number;
    tokens: number;
    description: string;
    popular?: boolean;
    sortOrder?: number;
  },
) {
  const existing = await prisma.pricingTier.findUnique({ where: { tierId: data.tierId } });
  if (existing) {
    throw new Error('Tier ID already exists');
  }

  const tier = await prisma.pricingTier.create({
    data: {
      tierId: data.tierId,
      name: data.name,
      price: data.price,
      tokens: data.tokens,
      description: data.description,
      popular: data.popular ?? false,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  auditLog.record(adminEmail, 'CREATE_PRICING_TIER', data.tierId, `price=${data.price}`);
  return tier;
}

// ─── Lead Templates ─────────────────────────────────────────────────────────

export async function listLeadTemplates() {
  const templates = await prisma.leadTemplate.findMany({
    orderBy: { industry: 'asc' },
  });
  return templates;
}

export async function upsertLeadTemplate(
  adminEmail: string,
  industry: string,
  companies: string[],
) {
  const template = await prisma.leadTemplate.upsert({
    where: { industry },
    update: { companies },
    create: { industry, companies },
  });

  auditLog.record(adminEmail, 'UPSERT_LEAD_TEMPLATE', industry, `companies=${companies.length}`);
  return template;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

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
