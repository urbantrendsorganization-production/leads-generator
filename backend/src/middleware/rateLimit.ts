import { Request, Response, NextFunction } from 'express';

const stores = new Map<string, Map<string, { count: number; resetAt: number }>>();

function getStore(name: string): Map<string, { count: number; resetAt: number }> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  return store;
}

export function createRateLimit(maxRequests: number, windowMs: number = 60_000) {
  const storeName = `rl_${maxRequests}_${windowMs}_${Date.now()}`;

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const store = getStore(storeName);

    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    entry.count++;
    next();
  };
}

// Default rate limiter (30 req/min) — backward-compatible export
export const rateLimit = createRateLimit(30, 60_000);

// Pre-configured limiters for specific route groups
export const authRateLimit = createRateLimit(10, 60_000);
export const searchRateLimit = createRateLimit(20, 60_000);
export const adminRateLimit = createRateLimit(60, 60_000);

// Cleanup expired entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}, 60_000);
