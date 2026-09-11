import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { saveComparisonSchema } from '@/lib/validations';
import { errorResponse, successResponse } from '@/lib/api-response';

// GET /api/comparisons — List saved comparisons for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required to access saved comparisons', 401);
    }

    const savedComparisons = await prisma.savedComparison.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Populate college metadata for each comparison set
    const allCollegeIds = Array.from(
      new Set(savedComparisons.flatMap((item) => item.collegeIds))
    );

    const colleges = await prisma.college.findMany({
      where: { id: { in: allCollegeIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        city: true,
        state: true,
        fees: true,
        rating: true,
        logoUrl: true,
        nationalRanking: true,
      },
    });

    const collegeMap = new Map(colleges.map((c) => [c.id, c]));

    const populated = savedComparisons.map((item) => ({
      id: item.id,
      name: item.name,
      collegeIds: item.collegeIds,
      colleges: item.collegeIds
        .map((cid) => collegeMap.get(cid))
        .filter(Boolean),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return successResponse(populated);
  } catch (error) {
    console.error('Error fetching saved comparisons:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve saved comparisons', 500);
  }
}

// POST /api/comparisons — Save a comparison set (2-3 colleges)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required to save a comparison', 401);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('INVALID_BODY', 'Request body must be valid JSON', 400);
    }

    const parseResult = saveComparisonSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse('VALIDATION_ERROR', issue.message, 400);
    }

    const { collegeIds, name: customName } = parseResult.data;

    // Verify target colleges exist
    const colleges = await prisma.college.findMany({
      where: { id: { in: collegeIds } },
      select: { id: true, name: true, slug: true, location: true, fees: true, rating: true, nationalRanking: true, logoUrl: true },
    });

    if (colleges.length !== collegeIds.length) {
      return errorResponse(
        'NOT_FOUND',
        'One or more colleges selected for comparison do not exist',
        404
      );
    }

    // Deduplication check: Prevent saving identical comparison combinations
    const existingComparisons = await prisma.savedComparison.findMany({
      where: { userId: user.id },
      select: { id: true, collegeIds: true },
    });

    const targetKey = [...collegeIds].sort().join(',');
    const hasDuplicate = existingComparisons.some(
      (comp) => [...comp.collegeIds].sort().join(',') === targetKey
    );

    if (hasDuplicate) {
      return errorResponse(
        'ALREADY_SAVED',
        'You have already saved a comparison with this exact combination of colleges',
        409
      );
    }

    // Auto-generate name if not provided
    const comparisonName =
      customName?.trim() ||
      colleges.map((c) => c.name).join(' vs ');

    const savedRecord = await prisma.savedComparison.create({
      data: {
        userId: user.id,
        name: comparisonName,
        collegeIds,
      },
    });

    return successResponse(
      {
        ...savedRecord,
        colleges,
      },
      201
    );
  } catch (error) {
    console.error('Error saving comparison:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to save comparison', 500);
  }
}
