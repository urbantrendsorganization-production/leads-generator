import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { registerUser, loginUser, getMe, registerSchema, loginSchema, googleLogin } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { authRateLimit } from '../middleware/rateLimit';

export const authRouter = Router();

const IS_PROD = process.env.NODE_ENV === 'production';

/** Set JWT as HttpOnly cookie alongside JSON response */
function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24h — matches JWT expiry
    path: '/',
  });
}

// ─── CSRF token endpoint (double-submit cookie pattern) ─────────────────────
authRouter.get('/csrf', (_req: Request, res: Response) => {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', csrfToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    signed: false,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  res.json({ csrfToken });
});

authRouter.post('/google-login', authRateLimit, async (req: Request, res: Response) => {
  console.log('Received Google Login request');
  try {
    const { idToken } = req.body;
    if (!idToken) {
      console.warn('Google Login: Missing idToken');
      res.status(400).json({ error: 'idToken is required' });
      return;
    }
    const result = await googleLogin(idToken);
    console.log('Google Login successful for:', result.user.email);
    setAuthCookie(res, result.token);
    res.json(result);
  } catch (error: any) {
    console.error('Google Login error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

authRouter.post('/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);
    setAuthCookie(res, result.token);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});

authRouter.post('/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    setAuthCookie(res, result.token);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    res.status(401).json({ error: error.message });
  }
});

authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await getMe(req.user!.userId);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});
