import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { leadsRouter } from './routes/leads';
import { promosRouter } from './routes/promos';
import { paymentsRouter } from './routes/payments';
import { adminRouter } from './routes/admin';
import { pricingRouter } from './routes/pricing';
import { sanitize } from './middleware/sanitize';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// ─── Security headers (3c) ──────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.removeHeader('X-Powered-By');
  next();
});

// ─── CORS hardening (3g) ────────────────────────────────────────────────────
const allowedOrigins: string[] = [];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean));
}
if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl) in development
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        // In production, allow no-origin only for GET requests (handled per-route below)
        callback(null, false);
        return;
      }
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// In production, reject non-GET requests with no Origin header
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.method !== 'GET' && !req.headers.origin) {
      // Allow webhook endpoint without origin
      if (req.path === '/api/payments/webhook') {
        next();
        return;
      }
      res.status(403).json({ error: 'Origin header required' });
      return;
    }
    next();
  });
}

// Webhook needs raw body — must come before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50kb' }));

// Input sanitization (3b)
app.use(sanitize);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/promos', promosRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/pricing', pricingRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TrendyyLeads API running on http://localhost:${PORT}`);
});
