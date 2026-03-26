import { Router, Request, Response } from 'express';
import {
  initializeTransaction,
  handleWebhook,
  verifyAndCreditTransaction,
  checkoutSchema,
} from '../services/payments.service';
import { authenticate } from '../middleware/auth';

export const paymentsRouter = Router();

paymentsRouter.post('/checkout', authenticate, async (req: Request, res: Response) => {
  try {
    const { tierId, timezone } = req.body;
    checkoutSchema.parse({ tierId });

    // Resolve real client IP (works behind proxies / Nginx / Render / Railway)
    const clientIp: string =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '0.0.0.0';

    const result = await initializeTransaction(req.user!.userId, tierId, clientIp, timezone);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});

// Called by frontend after Paystack redirect — credits tokens if webhook hasn't fired yet
paymentsRouter.post('/verify', authenticate, async (req: Request, res: Response) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      res.status(400).json({ error: 'Missing reference' });
      return;
    }
    const result = await verifyAndCreditTransaction(reference, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Paystack webhook — whitelist IPs in production: 52.31.139.75, 52.49.173.169, 52.214.14.220
paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: 'Missing x-paystack-signature header' });
      return;
    }
    const result = await handleWebhook(req.body, signature);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
