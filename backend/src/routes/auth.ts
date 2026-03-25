import { Router, Request, Response } from 'express';
import { registerUser, loginUser, getMe, registerSchema, loginSchema } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

export const authRouter = Router();

authRouter.post('/register', rateLimit, async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});

authRouter.post('/login', rateLimit, async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
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
