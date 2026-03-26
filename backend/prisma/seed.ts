import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@trendyyleads.com' },
    update: {},
    create: {
      email: 'admin@trendyyleads.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      tokenBalance: 9999,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'URBANPARTNER2024' },
    update: {},
    create: {
      code: 'URBANPARTNER2024',
      tokensGrant: 9999,
      maxUses: null,
      active: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'WELCOME50' },
    update: {},
    create: {
      code: 'WELCOME50',
      tokensGrant: 50,
      maxUses: 100,
      active: true,
    },
  });

  // Seed pricing tiers
  const tiers = [
    { tierId: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false, sortOrder: 0 },
    { tierId: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true, sortOrder: 1 },
    { tierId: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false, sortOrder: 2 },
  ];

  for (const tier of tiers) {
    await prisma.pricingTier.upsert({
      where: { tierId: tier.tierId },
      update: {},
      create: tier,
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
