import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const INVALIDATE_BEFORE = process.env.JWT_INVALIDATE_BEFORE
  ? parseInt(process.env.JWT_INVALIDATE_BEFORE, 10)
  : 0;

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  jti?: string;
  iat?: number;
}

export function signToken(payload: Omit<JwtPayload, 'jti' | 'iat'>): string {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    SECRET,
    { expiresIn: '24h' },
  );
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, SECRET) as JwtPayload;

  // Reject tokens issued before the invalidation timestamp
  if (INVALIDATE_BEFORE && decoded.iat && decoded.iat < INVALIDATE_BEFORE) {
    throw new Error('Token has been invalidated');
  }

  return decoded;
}
