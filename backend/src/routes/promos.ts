import { Router, Request, Response } from 'express';
import { redeemPromoCode, redeemSchema } from '../services/promos.service';
import { authenticate } from '../middleware/auth';

export const promosRouter = Router();

promosRouter.post('/redeem', authenticate, async (req: Request, res: Response) => {
  try {
    const { code } = redeemSchema.parse(req.body);
    const result = await redeemPromoCode(req.user!.userId, code);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});
