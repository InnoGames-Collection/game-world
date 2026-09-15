import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAuthToken, AuthJwtPayload } from '../utils/jwt.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthJwtPayload;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      message: 'Authentication required. Missing or malformed Bearer token.',
    });
  }

  const token = authHeader.slice(7).trim();
  const payload = verifyAuthToken(token);
  if (!payload) {
    return reply.status(401).send({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }

  request.user = payload;
}

export async function optionalAuth(request: FastifyRequest) {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const payload = verifyAuthToken(token);
    if (payload) {
      request.user = payload;
    }
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply);
  if (reply.sent) return;

  if (request.user?.role !== 'admin') {
    return reply.status(403).send({
      success: false,
      message: 'Access denied: Administrator privilege required.',
    });
  }
}
