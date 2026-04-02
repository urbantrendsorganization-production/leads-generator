import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const passwordSchema = z.string().regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  'Password must be 8+ chars with uppercase, lowercase, and a number',
);

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function googleLogin(idToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google token');
    }

    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user if not exists
      // Since passwordHash is required, we use a random one
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          passwordHash,
          tokenBalance: 1,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tokenBalance: user.tokenBalance,
      },
    };
  } catch (error: any) {
    throw new Error(`Google authentication failed: ${error.message}`);
  }
}

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name || null,
      passwordHash,
      tokenBalance: 1,
    },
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenBalance: user.tokenBalance,
    },
  };
}

// ─── Account lockout tracking (in-memory) ──────────────────────────────────
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts.entries()) {
    if (now > entry.lockedUntil + LOCKOUT_DURATION_MS) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkAndRecordAttempt(email: string, success: boolean): void {
  const now = Date.now();
  const entry = loginAttempts.get(email);

  if (entry && entry.lockedUntil > now) {
    const remainingMin = Math.ceil((entry.lockedUntil - now) / 60_000);
    throw new Error(`Account temporarily locked. Try again in ${remainingMin} minute(s).`);
  }

  if (success) {
    loginAttempts.delete(email);
    return;
  }

  // Record failed attempt
  if (!entry || now > entry.lockedUntil) {
    loginAttempts.set(email, { count: 1, lockedUntil: now + LOCKOUT_WINDOW_MS });
  } else {
    entry.count++;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_DURATION_MS;
      throw new Error('Too many failed login attempts. Account locked for 15 minutes.');
    }
  }
}

export async function loginUser(data: z.infer<typeof loginSchema>) {
  // Check if locked before doing anything
  const existingEntry = loginAttempts.get(data.email);
  if (existingEntry && existingEntry.lockedUntil > Date.now()) {
    const remainingMin = Math.ceil((existingEntry.lockedUntil - Date.now()) / 60_000);
    throw new Error(`Account temporarily locked. Try again in ${remainingMin} minute(s).`);
  }

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    checkAndRecordAttempt(data.email, false);
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    checkAndRecordAttempt(data.email, false);
    throw new Error('Invalid email or password');
  }

  // Successful login — clear lockout
  checkAndRecordAttempt(data.email, true);

  // If user had a temp password, clear it on successful login
  if (user.mustChangePassword) {
    await prisma.user.update({
      where: { id: user.id },
      data: { mustChangePassword: false },
    });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return {
    token,
    mustChangePassword: user.mustChangePassword,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenBalance: user.tokenBalance,
      mustChangePassword: user.mustChangePassword,
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tokenBalance: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Premium check: user has any completed transaction OR tokenBalance >= 5
  const completedTxCount = await prisma.transaction.count({
    where: { userId, status: 'completed' },
  });

  const isPremium = completedTxCount > 0 || user.tokenBalance >= 5;

  return {
    ...user,
    isPremium,
  };
}
