import { Router, Request, Response } from 'express';
import { PRICING_TIERS } from '../services/payments.service';

export const pricingRouter = Router();

pricingRouter.get('/', (_req: Request, res: Response) => {
  res.json(PRICING_TIERS);
});
