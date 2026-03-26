import { Router, Request, Response } from 'express';
import {
  listUsers,
  listPromoCodes,
  createPromoCode,
  togglePromoCode,
  getAnalytics,
  createPromoSchema,
  listPricingTiers,
  updatePricingTier,
  createPricingTier,
  listLeadTemplates,
  upsertLeadTemplate,
  createStaff,
  updateUserRole,
  updateUserTokens,
  deleteUser,
  resetUserPassword,
} from '../services/admin.service';
import { authenticate, requireAdmin } from '../middleware/auth';
import { adminRateLimit } from '../middleware/rateLimit';
import { auditLog } from '../utils/auditLog';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin, adminRateLimit);

// ─── Users ──────────────────────────────────────────────────────────────────

adminRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, name, role } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    const result = await createStaff(req.user!.email, { email, name, role: role || 'CLIENT' });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

adminRouter.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;
    const { role, tokenBalance } = req.body;

    let user;
    if (role !== undefined) {
      user = await updateUserRole(req.user!.email, userId, role);
    }
    if (tokenBalance !== undefined) {
      user = await updateUserTokens(req.user!.email, userId, tokenBalance);
    }

    if (!user) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

adminRouter.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const result = await deleteUser(req.user!.email, req.params.id as string, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

adminRouter.post('/users/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const result = await resetUserPassword(req.user!.email, req.params.id as string);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ─── Promo Codes ────────────────────────────────────────────────────────────

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
    const promo = await createPromoCode(req.user!.email, data);
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
    const promo = await togglePromoCode(req.user!.email, promoId, active);
    res.json(promo);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ─── Pricing Tiers ──────────────────────────────────────────────────────────

adminRouter.get('/pricing', async (_req: Request, res: Response) => {
  try {
    const tiers = await listPricingTiers();
    res.json(tiers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.patch('/pricing/:tierId', async (req: Request, res: Response) => {
  try {
    const tier = await updatePricingTier(req.user!.email, req.params.tierId as string, req.body);
    res.json(tier);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

adminRouter.post('/pricing', async (req: Request, res: Response) => {
  try {
    const { tierId, name, price, tokens, description, popular, sortOrder } = req.body;
    if (!tierId || !name || price === undefined || tokens === undefined || !description) {
      res.status(400).json({ error: 'tierId, name, price, tokens, and description are required' });
      return;
    }
    const tier = await createPricingTier(req.user!.email, {
      tierId, name, price, tokens, description, popular, sortOrder,
    });
    res.status(201).json(tier);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ─── Lead Templates ─────────────────────────────────────────────────────────

adminRouter.get('/lead-templates', async (_req: Request, res: Response) => {
  try {
    const templates = await listLeadTemplates();
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put('/lead-templates/:industry', async (req: Request, res: Response) => {
  try {
    const { companies } = req.body;
    if (!Array.isArray(companies)) {
      res.status(400).json({ error: 'companies must be an array of strings' });
      return;
    }
    const template = await upsertLeadTemplate(
      req.user!.email,
      req.params.industry as string,
      companies.filter((c: any) => typeof c === 'string' && c.trim()),
    );
    res.json(template);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ─── Analytics ──────────────────────────────────────────────────────────────

adminRouter.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Audit Log ──────────────────────────────────────────────────────────────

adminRouter.get('/audit-log', async (_req: Request, res: Response) => {
  try {
    const entries = auditLog.getRecent(100);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
