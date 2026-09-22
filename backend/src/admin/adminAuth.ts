import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';
import { query } from '../config/database.js';

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: 'admin' | 'auditor';
}

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: AdminSessionPayload;
  }
}

export const adminAuth = {
  /**
   * Generate a secure random token and hash for magic link
   */
  generateToken(): { rawToken: string; tokenHash: string } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHmac('sha256', env.MAGIC_LINK_SECRET)
      .update(rawToken)
      .digest('hex');
    return { rawToken, tokenHash };
  },

  /**
   * Hash a raw token to compare against database
   */
  hashToken(rawToken: string): string {
    return crypto
      .createHmac('sha256', env.MAGIC_LINK_SECRET)
      .update(rawToken)
      .digest('hex');
  },

  /**
   * Sign an admin session JWT (8 hours validity)
   */
  signAdminSession(payload: AdminSessionPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '8h' });
  },

  /**
   * Verify an admin session JWT
   */
  verifyAdminSession(token: string): AdminSessionPayload | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AdminSessionPayload;
    } catch {
      return null;
    }
  },
};

/**
 * Fastify Hook: require valid admin or auditor session
 */
export async function requireAdminSession(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  const cookieHeader = request.headers.cookie;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (cookieHeader) {
    const match = cookieHeader.match(/goplay_admin_session=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return reply.status(401).send({
      success: false,
      message: 'Unauthorized: Admin or Auditor session token required.',
    });
  }

  const payload = adminAuth.verifyAdminSession(token);
  if (!payload) {
    return reply.status(401).send({
      success: false,
      message: 'Invalid or expired admin session token. Please request a new magic link.',
    });
  }

  // Verify that admin account is still active in database
  const userCheck = await query('SELECT is_active FROM admin_users WHERE id = $1', [payload.adminId]);
  if (!userCheck.rowCount || !userCheck.rows[0].is_active) {
    return reply.status(403).send({
      success: false,
      message: 'Account suspended or inactive. Contact administrator.',
    });
  }

  request.adminUser = payload;
}

/**
 * Fastify Hook: require full 'admin' role (auditors are blocked)
 */
export async function requireSuperAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAdminSession(request, reply);
  if (reply.sent) return;

  if (request.adminUser?.role !== 'admin') {
    return reply.status(403).send({
      success: false,
      message: 'Access denied: Requires System Administrator privileges. (Auditor accounts have read-only permissions).',
    });
  }
}
