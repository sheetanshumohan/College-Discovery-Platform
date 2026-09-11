import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';
import { checkLoginRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('INVALID_BODY', 'Request body must be valid JSON', 400);
    }

    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse('VALIDATION_ERROR', issue.message, 400);
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 5 attempts per minute brute-force limit
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
    const rateLimitKey = `${clientIp}:${normalizedEmail}`;
    const rateLimit = checkLoginRateLimit(rateLimitKey, 5, 60 * 1000);

    if (!rateLimit.allowed) {
      return errorResponse(
        'RATE_LIMIT_EXCEEDED',
        `Too many login attempts. Please try again in ${rateLimit.resetSeconds} seconds.`,
        429,
        undefined,
        { 'Retry-After': String(rateLimit.resetSeconds) }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const token = await createSessionToken({ userId: user.id, email: user.email });
    const response = successResponse({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to log in', 500);
  }
}
