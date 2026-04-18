import { Router, Request, Response } from 'express';
import { searchLeads, getSearchHistory, searchSchema } from '../services/leads.service';
import { sendWhatsAppText, sendWhatsAppTemplate, isWhatsAppConfigured } from '../services/whatsapp.service';
import { searchLocalBusinesses, isPlacesConfigured } from '../services/places.service';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { searchRateLimit } from '../middleware/rateLimit';

export const leadsRouter = Router();

leadsRouter.post('/search', authenticate, searchRateLimit, async (req: Request, res: Response) => {
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

/** Check whether the platform's WhatsApp Cloud API is configured */
leadsRouter.get('/whatsapp/status', authenticate, async (_req: Request, res: Response) => {
  res.json({ configured: isWhatsAppConfigured() });
});

/** Check whether Google Places API is configured */
leadsRouter.get('/local-search/status', authenticate, async (_req: Request, res: Response) => {
  res.json({ configured: isPlacesConfigured() });
});

/**
 * Local business search via Google Places.
 * Finds real businesses (restaurants, salons, gyms…) in a given city/country
 * and scores them by website presence — no website = high outreach opportunity.
 *
 * Body: { businessType: string, location: string, opportunityFilter?: 'all'|'no-website'|'no-or-social' }
 * Costs 1 token per search.
 */
leadsRouter.post('/local-search', authenticate, searchRateLimit, async (req: Request, res: Response) => {
  const { businessType, location, opportunityFilter = 'all' } = req.body as {
    businessType?: string;
    location?: string;
    opportunityFilter?: 'all' | 'no-website' | 'no-or-social';
  };

  if (!businessType || typeof businessType !== 'string' || !businessType.trim()) {
    res.status(400).json({ error: 'businessType is required (e.g. "restaurants")' });
    return;
  }
  if (!location || typeof location !== 'string' || !location.trim()) {
    res.status(400).json({ error: 'location is required (e.g. "Madrid, Spain")' });
    return;
  }

  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (user.tokenBalance <= 0) {
    res.status(402).json({ error: 'Insufficient tokens. Please purchase more searches.' });
    return;
  }

  try {
    const leads = await searchLocalBusinesses(
      businessType.trim(),
      location.trim(),
      opportunityFilter,
    );

    await prisma.user.update({
      where: { id: userId },
      data: { tokenBalance: { decrement: 1 } },
    });

    res.json({ leads, remainingTokens: user.tokenBalance - 1 });
  } catch (error: any) {
    if (error.message.includes('not configured')) {
      res.status(503).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send a WhatsApp message to a lead's number.
 * Body:
 *   { to: string, message?: string, templateName?: string, useTemplate?: boolean }
 *
 * Premium users only (checked client-side; server deducts no tokens for outreach).
 */
leadsRouter.post('/whatsapp', authenticate, async (req: Request, res: Response) => {
  const { to, message, templateName, useTemplate, languageCode } = req.body as {
    to?: string;
    message?: string;
    templateName?: string;
    useTemplate?: boolean;
    languageCode?: string;
  };

  if (!to || typeof to !== 'string') {
    res.status(400).json({ error: 'Phone number (to) is required.' });
    return;
  }

  try {
    let result;
    if (useTemplate && templateName) {
      result = await sendWhatsAppTemplate(to, templateName, languageCode || 'en_US');
    } else {
      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Message body is required.' });
        return;
      }
      result = await sendWhatsAppText(to, message.trim());
    }

    if (!result.success) {
      res.status(502).json({ error: result.error });
      return;
    }
    res.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
