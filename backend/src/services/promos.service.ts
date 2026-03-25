import { prisma } from '../utils/prisma';
import { z } from 'zod';

export const redeemSchema = z.object({
  code: z.string().min(1, 'Promo code is required').transform(s => s.toUpperCase().trim()),
});

export async function redeemPromoCode(userId: string, code: string) {
  const promo = await prisma.promoCode.findUnique({ where: { code } });

  if (!promo) {
    throw new Error('Invalid promo code');
  }

  if (!promo.active) {
    throw new Error('This promo code has been deactivated');
  }

  if (promo.maxUses !== null && promo.uses >= promo.maxUses) {
    throw new Error('This promo code has reached its usage limit');
  }

  const existingRedemption = await prisma.promoRedemption.findUnique({
    where: {
      userId_promoCodeId: {
        userId,
        promoCodeId: promo.id,
      },
    },
  });

  if (existingRedemption) {
    throw new Error('You have already redeemed this promo code');
  }

  const [, , updatedUser] = await prisma.$transaction([
    prisma.promoRedemption.create({
      data: {
        userId,
        promoCodeId: promo.id,
      },
    }),
    prisma.promoCode.update({
      where: { id: promo.id },
      data: { uses: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { tokenBalance: { increment: promo.tokensGrant } },
    }),
  ]);

  return {
    tokensAdded: promo.tokensGrant,
    newBalance: updatedUser.tokenBalance,
  };
}
