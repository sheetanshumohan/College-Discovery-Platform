import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('INVALID_BODY', 'Request body must be valid JSON', 400);
    }

    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse('VALIDATION_ERROR', issue.message, 400);
    }

    const { name, email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return errorResponse('EMAIL_ALREADY_EXISTS', 'An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Create session token and set HTTP-only cookie on response
    const token = await createSessionToken({ userId: user.id, email: user.email });
    const response = successResponse(user, 201);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to register account', 500);
  }
}
