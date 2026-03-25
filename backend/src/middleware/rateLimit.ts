import { Request, Response, NextFunction } from 'express';

const windowMs = 60 * 1000;
const maxRequests = 30;

const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  const now = Date.now();

  const entry = requests.get(key);
  if (!entry || now > entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (entry.count >= maxRequests) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  entry.count++;
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requests.entries()) {
    if (now > entry.resetAt) {
      requests.delete(key);
    }
  }
}, 60 * 1000);
