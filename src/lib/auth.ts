import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'collegefinder_production_secure_jwt_secret_key_32chars_min';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
export const AUTH_COOKIE_NAME = 'cf_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(request?: NextRequest | Request) {
  let token: string | undefined;

  // 1. Check request object if provided
  if (request) {
    if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
      token = (request as NextRequest).cookies.get(AUTH_COOKIE_NAME)?.value;
    }
    if (!token && request.headers) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
        if (match) {
          token = match[1];
        }
      }
    }
  }

  // 2. Fall back to Next.js cookies() API inside request context
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // Ignore error when called outside Next.js request context
    }
  }

  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}
