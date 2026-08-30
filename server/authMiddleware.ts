import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logSecurityEvent } from './security';

const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'either-ai-sovereign-master-secret-key-2026';
const ADMIN_TOKEN = process.env.EITHER_ADMIN_TOKEN || '39302e2703da53f49f05633c42873bcfe21f97de04f87f4fc4d8d57b6ae97f2f';

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Sign JWT session token
 */
export function signUserToken(user: { userId: string; email: string; name?: string; role?: 'user' | 'admin' }): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token
 */
export function verifyUserToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Timing-safe string comparison to protect against timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = crypto.createHash('sha256').update(a || '').digest();
    const bufB = crypto.createHash('sha256').update(b || '').digest();
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Middleware: Require valid JWT authentication for sensitive/mutating routes
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Allow local desktop environment or internal service tokens
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-auth-token'] as string;
  const adminHeader = req.headers['x-lb-token'] as string;

  // If valid admin token supplied, grant access immediately
  if (adminHeader && timingSafeCompare(adminHeader, ADMIN_TOKEN)) {
    req.user = { userId: 'admin', email: 'admin@either.local', role: 'admin' };
    return next();
  }

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  // If running on localhost development with default user, authorize default user
  const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === 'localhost';
  if (!token && isLocalhost && process.env.NODE_ENV !== 'production') {
    req.user = { userId: 'local-dev', email: 'gamanreddy.goona@gmail.com', role: 'admin' };
    return next();
  }

  if (!token) {
    logSecurityEvent({
      user: 'anonymous',
      action: req.path,
      verdict: 'BLOCKED',
      details: 'Missing Authorization Token'
    });
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Bearer token in Authorization header.'
    });
  }

  const verified = verifyUserToken(token);
  if (!verified) {
    logSecurityEvent({
      user: 'invalid_token',
      action: req.path,
      verdict: 'BLOCKED',
      details: 'Invalid or Expired JWT Token'
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token.'
    });
  }

  req.user = verified;
  next();
}

/**
 * Middleware: Require Administrator privileges
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminHeader = req.headers['x-lb-token'] as string;
  if (adminHeader && timingSafeCompare(adminHeader, ADMIN_TOKEN)) {
    return next();
  }

  if (req.user && req.user.role === 'admin') {
    return next();
  }

  logSecurityEvent({
    user: req.user?.email || 'anonymous',
    action: req.path,
    verdict: 'BLOCKED',
    details: 'Administrator Privileges Required'
  });

  return res.status(403).json({
    success: false,
    error: 'Access denied: Administrator privileges required.'
  });
}

/**
 * Middleware: Input Sanitization and Boundary Validation
 */
export function sanitizeAndValidateInputs(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      const val = req.body[key];
      // Prevent oversized inputs
      if (typeof val === 'string' && val.length > 50000) {
        return res.status(400).json({
          success: false,
          error: `Payload field "${key}" exceeds maximum allowed size (50KB).`
        });
      }
    }
  }
  next();
}
