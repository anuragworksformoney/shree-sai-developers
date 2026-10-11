import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient, getSupabaseConfigStatus } from './supabase';

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'shree-sai-developers-admin-secret-key-2026';
const ADMIN_ALLOWED_EMAILS = [
  (process.env.ADMIN_EMAIL || 'ssdofficial0001@gmail.com').toLowerCase().trim(),
  'shreesaideveloper.in@gmail.com',
];
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'SaiDev@2026';

export interface AdminSessionPayload {
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Creates a signed cryptographically secure HMAC-SHA256 token
 */
export function generateAdminToken(email: string): string {
  const payload: AdminSessionPayload = {
    email: email.toLowerCase().trim(),
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days validity
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Validates token signature and expiration
 */
export function verifyAdminToken(token: string): AdminSessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expectedSig) {
    return null;
  }

  try {
    const payload: AdminSessionPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Attempts authentication using Supabase Auth or verified Admin credentials
 */
export async function authenticateAdmin(email: string, password: string): Promise<{
  success: boolean;
  email?: string;
  token?: string;
  error?: string;
}> {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanPassword = password || '';

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Email and password are required.' };
  }

  // 1. Try Supabase Auth if configured
  const supabaseStatus = getSupabaseConfigStatus();
  if (supabaseStatus.configured) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          const token = generateAdminToken(cleanEmail);
          return { success: true, email: cleanEmail, token };
        }
      } catch (err) {
        console.warn('[Supabase Auth Check Note]:', err);
      }
    }
  }

  // 2. Verified Admin Credential check
  const isAllowedEmail = ADMIN_ALLOWED_EMAILS.includes(cleanEmail);
  const isPasswordValid = cleanPassword === ADMIN_DEFAULT_PASSWORD;

  if (isAllowedEmail && isPasswordValid) {
    const token = generateAdminToken(cleanEmail);
    return { success: true, email: cleanEmail, token };
  }

  return {
    success: false,
    error: 'Invalid admin credentials. Please verify your email and password.',
  };
}

/**
 * Express Middleware: Blocks unauthenticated users from admin API endpoints
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
  let token = '';

  if (authHeader) {
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (typeof authHeader === 'string') {
      token = authHeader.trim();
    }
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Access denied. You must be authenticated as an administrator to perform this action.',
    });
  }

  (req as any).adminUser = payload;
  next();
}
