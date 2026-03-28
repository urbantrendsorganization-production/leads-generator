import { Request, Response, NextFunction } from 'express';

/**
 * Double-submit cookie CSRF protection.
 * Checks that the X-CSRF-Token header matches the csrf_token cookie.
 * Skips GET/HEAD/OPTIONS and webhook routes.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip webhook routes (Paystack sends server-to-server without CSRF)
  if (req.path.includes('webhook')) {
    return next();
  }

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'] as string | undefined;

  // If no CSRF cookie set, skip enforcement (allows gradual adoption —
  // clients that have not fetched /api/auth/csrf yet will still work)
  if (!cookieToken) {
    return next();
  }

  if (!headerToken || headerToken !== cookieToken) {
    res.status(403).json({ error: 'Invalid or missing CSRF token' });
    return;
  }

  next();
}
