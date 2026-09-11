import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { saveCollegeSchema } from '@/lib/validations';
import { errorResponse, successResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/saved — List saved colleges for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required to access saved colleges', 401);
    }

    const savedColleges = await prisma.savedCollege.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            city: true,
            state: true,
            description: true,
            fees: true,
            rating: true,
            type: true,
            campusSetting: true,
            nationalRanking: true,
            acceptanceRate: true,
            graduationRate: true,
            inStateTuition: true,
            outOfStateTuition: true,
            logoUrl: true,
          },
        },
      },
    });

    return successResponse(savedColleges);
  } catch (error) {
    console.error('Error fetching saved colleges:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve saved colleges', 500);
  }
}

// POST /api/saved — Save a college for authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required to save a college', 401);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('INVALID_BODY', 'Request body must be valid JSON', 400);
    }

    const parseResult = saveCollegeSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse('VALIDATION_ERROR', issue.message, 400);
    }

    const { collegeId, notes } = parseResult.data;

    // Verify target college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true, name: true },
    });

    if (!college) {
      return errorResponse('NOT_FOUND', `College with ID "${collegeId}" does not exist`, 404);
    }

    // Check for duplicate saved record
    const existingSaved = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId,
        },
      },
    });

    if (existingSaved) {
      return errorResponse('ALREADY_SAVED', 'This college is already in your saved list', 409);
    }

    const savedRecord = await prisma.savedCollege.create({
      data: {
        userId: user.id,
        collegeId,
        notes: notes?.trim() || null,
      },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            city: true,
            state: true,
            fees: true,
            rating: true,
          },
        },
      },
    });

    return successResponse(savedRecord, 201);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return errorResponse('ALREADY_SAVED', 'This college is already in your saved list', 409);
    }
    console.error('Error saving college:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to save college', 500);
  }
}
