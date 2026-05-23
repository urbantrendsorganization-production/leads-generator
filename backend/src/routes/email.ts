import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import {
  isResendConfigured, sendColdEmail, getEmailHistory,
  getUserCampaigns, createCampaign, trackOpen, trackClick,
} from '../services/email.service';

export const emailRouter = Router();

const TRACKING_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const sendSchema = z.object({
  toEmail: z.string().email(),
  toName: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

const campaignSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

emailRouter.get('/status', authenticate, (_req: Request, res: Response) => {
  res.json({ configured: isResendConfigured() });
});

emailRouter.post('/send', authenticate, async (req: Request, res: Response) => {
  if (!isResendConfigured()) {
    res.status(503).json({ error: 'Email sending is not configured on this server.' });
    return;
  }
  try {
    const payload = sendSchema.parse(req.body);
    const result = await sendColdEmail(req.user!.userId, payload);
    if (!result.success) {
      res.status(502).json({ error: result.error || 'Send failed', sendId: result.sendId });
      return;
    }
    res.json({ success: true, sendId: result.sendId });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: err.message });
  }
});

emailRouter.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const history = await getEmailHistory(req.user!.userId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

emailRouter.get('/campaigns', authenticate, async (req: Request, res: Response) => {
  try {
    const campaigns = await getUserCampaigns(req.user!.userId);
    res.json(campaigns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

emailRouter.post('/campaigns', authenticate, async (req: Request, res: Response) => {
  try {
    const data = campaignSchema.parse(req.body);
    const campaign = await createCampaign(req.user!.userId, data);
    res.status(201).json(campaign);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: err.message });
  }
});

// Open tracking pixel — public, no CSRF needed (GET)
emailRouter.get('/track/open/:sendId.gif', async (req: Request, res: Response) => {
  const { sendId } = req.params as { sendId: string };
  await trackOpen(sendId);
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.end(TRACKING_GIF);
});

// Click tracking redirect — public, no CSRF needed (GET)
emailRouter.get('/track/click/:sendId', async (req: Request, res: Response) => {
  const { sendId } = req.params as { sendId: string };
  const { url } = req.query as { url?: string };

  if (!url) {
    res.status(400).json({ error: 'url parameter required' });
    return;
  }

  // Prevent open redirect to non-http(s) URLs
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      res.status(400).json({ error: 'Invalid redirect URL' });
      return;
    }
  } catch {
    res.status(400).json({ error: 'Invalid redirect URL' });
    return;
  }

  await trackClick(sendId);
  res.redirect(302, url);
});
