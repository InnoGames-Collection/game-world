import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthJwtPayload {
  userId: string;
  phone: string;
  role: 'player' | 'admin';
}

export interface GameRoundJwtPayload {
  uid: string;
  gid: string;
  tid?: string;
  jti: string;
  iat: number;
  exp: number;
}

export function signAccessToken(payload: AuthJwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
}

export function signRefreshToken(payload: AuthJwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function verifyAuthToken(token: string): AuthJwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthJwtPayload;
  } catch {
    return null;
  }
}

export function signGameRoundToken(payload: { uid: string; gid: string; tid?: string; jti: string }): string {
  return jwt.sign(payload, env.GAME_TOKEN_SECRET, {
    expiresIn: '15m', // 15 minutes max per game round
  });
}

export function verifyGameRoundToken(token: string): GameRoundJwtPayload | null {
  try {
    return jwt.verify(token, env.GAME_TOKEN_SECRET) as GameRoundJwtPayload;
  } catch {
    return null;
  }
}
