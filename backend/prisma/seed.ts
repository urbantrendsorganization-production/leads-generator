import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@urbanleads.com' },
    update: {},
    create: {
      email: 'admin@urbanleads.com',
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
