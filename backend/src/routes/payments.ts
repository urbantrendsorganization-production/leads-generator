import { Router, Request, Response } from 'express';
import { initializeTransaction, handleWebhook, verifyAndCreditTransaction, checkoutSchema } from '../services/payments.service';
import { authenticate } from '../middleware/auth';

export const paymentsRouter = Router();

paymentsRouter.post('/checkout', authenticate, async (req: Request, res: Response) => {
  try {
    const { tierId } = checkoutSchema.parse(req.body);
    const result = await initializeTransaction(req.user!.userId, tierId);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});

// Called by the frontend after Paystack redirect — credits tokens if webhook hasn't fired yet
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

// Paystack webhook endpoint
// NOTE: For production, consider whitelisting Paystack's IP addresses:
// 52.31.139.75, 52.49.173.169, 52.214.14.220
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
