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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

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
  console.log(`UrbanLeads API running on http://localhost:${PORT}`);
});
