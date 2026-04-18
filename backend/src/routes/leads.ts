import { Router, Request, Response } from 'express';
import { searchLeads, getSearchHistory, searchSchema } from '../services/leads.service';
import { sendWhatsAppText, sendWhatsAppTemplate, isWhatsAppConfigured } from '../services/whatsapp.service';
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
