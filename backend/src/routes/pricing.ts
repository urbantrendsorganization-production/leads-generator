import { Router, Request, Response } from 'express';
import { getPricingTiers } from '../services/payments.service';

export const pricingRouter = Router();

pricingRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const tiers = await getPricingTiers();
    res.json(tiers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
