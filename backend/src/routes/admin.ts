import { Router, Request, Response } from 'express';
import {
  listUsers,
  getAnalytics,
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
