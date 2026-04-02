import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { leadsRouter } from './routes/leads';
import { promosRouter } from './routes/promos';
import { paymentsRouter } from './routes/payments';
import { adminRouter } from './routes/admin';
import { pricingRouter } from './routes/pricing';
import { realtimeRouter } from './routes/realtime';
import { sanitize } from './middleware/sanitize';
import { csrfProtection } from './middleware/csrf';

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Since we are behind Nginx, we must trust the proxy headers (X-Forwarded-For, etc.)
app.set('trust proxy', 1);

// ─── Request ID tracking ──────────────────────────────────────────────────
app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});

// ─── Security headers ──────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Changed from DENY to allow same-origin iframes if needed
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; img-src 'self' data: https:; connect-src 'self' https://api.paystack.co https://autocomplete.clearbit.com https://accounts.google.com/gsi/ https://accounts.google.com; frame-src https://www.google.com https://accounts.google.com/gsi/"
  );
  res.removeHeader('X-Powered-By');
  next();
});

// ─── CORS hardening ────────────────────────────────────────────────────────
const allowedOrigins: string[] = [
  'https://trendyyleads.com', 
  'https://www.trendyyleads.com'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

if (process.env.ALLOWED_ORIGINS) {
  const extraOrigins = process.env.ALLOWED_ORIGINS.split(',')
    .map(o => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
  allowedOrigins.push(...extraOrigins);
}

// In Dev, we still want localhost access
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3002');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) 
    // but restricted by the production logic below
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
}));

// ─── Production Middleware ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Enforce Origin header for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !req.headers.origin) {
      // Allow Paystack/Stripe webhooks which don't send Origin headers
      if (req.path.includes('webhook')) {
        return next();
      }
      return res.status(403).json({ error: 'Origin header required for this operation' });
    }
    next();
  });
}

// Cookie parser — needed for HttpOnly auth cookie and CSRF
app.use(cookieParser());

// Webhook needs raw body — must come before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50kb' }));

// Input sanitization
app.use(sanitize);

// CSRF protection for state-changing routes (skips webhooks)
app.use(csrfProtection);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/promos', promosRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/realtime', realtimeRouter);

// Error Handling — central handler, never leaks stack traces in production
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const requestId = (req as any).requestId || 'unknown';

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation', requestId });
  }

  // Always log full error internally
  console.error(`[${requestId}] Unhandled error:`, IS_PROD ? err.message : err);

  res.status(500).json({
    error: 'Internal server error',
    requestId,
    ...(IS_PROD ? {} : { message: err.message, stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`TrendyyLeads API running on port ${PORT}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
});