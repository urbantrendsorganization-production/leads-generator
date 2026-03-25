import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

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

export async function loginUser(data: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
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
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
