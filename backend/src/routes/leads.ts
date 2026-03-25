import { Router, Request, Response } from 'express';
import { searchLeads, getSearchHistory, searchSchema } from '../services/leads.service';
import { authenticate } from '../middleware/auth';

export const leadsRouter = Router();

leadsRouter.post('/search', authenticate, async (req: Request, res: Response) => {
  try {
    const query = searchSchema.parse(req.body);
    const result = await searchLeads(req.user!.userId, query);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    if (error.message.includes('Insufficient tokens')) {
      res.status(402).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

leadsRouter.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const history = await getSearchHistory(req.user!.userId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
