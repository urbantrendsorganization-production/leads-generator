import { Router, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

export const realtimeRouter = Router();

/**
 * SSE endpoint for real-time token balance.
 * EventSource API does not support custom headers, so we accept
 * the JWT via ?token= query parameter as well as the standard
 * Authorization header or cookie.
 */
realtimeRouter.get('/token-balance', (req: Request, res: Response) => {
  // Authenticate: try header/cookie first, fall back to query param
  let userId: string;
  try {
    const header = req.headers.authorization;
    let token: string | undefined;

    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const payload = verifyToken(token);
    userId = payload.userId;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering for SSE
  });

  // Send current balance immediately
  async function sendBalance() {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
      });
      if (user) {
        res.write(`data: ${JSON.stringify({ tokenBalance: user.tokenBalance })}\n\n`);
      }
    } catch {
      // Swallow DB errors — connection may have closed
    }
  }

  // Send initial balance
  sendBalance();

  // Poll every 10 seconds
  const interval = setInterval(sendBalance, 10_000);

  // Heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30_000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
  });
});
