import { Router, Request, Response } from 'express';
import {
  listUsers,
  listPromoCodes,
  createPromoCode,
  togglePromoCode,
  getAnalytics,
  createPromoSchema,
} from '../services/admin.service';
import { authenticate, requireAdmin } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get('/promos', async (_req: Request, res: Response) => {
  try {
    const promos = await listPromoCodes();
    res.json(promos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post('/promos', async (req: Request, res: Response) => {
  try {
    const data = createPromoSchema.parse(req.body);
    const promo = await createPromoCode(data);
    res.status(201).json(promo);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});

adminRouter.patch('/promos/:id', async (req: Request, res: Response) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      res.status(400).json({ error: 'active must be a boolean' });
      return;
    }
    const promoId = req.params.id as string;
    const promo = await togglePromoCode(promoId, active);
    res.json(promo);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

adminRouter.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
