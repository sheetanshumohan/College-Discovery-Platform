import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { compareQuerySchema } from '@/lib/validations';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawIds = searchParams.get('ids');

    if (!rawIds) {
      return errorResponse('MISSING_PARAMETER', 'The "ids" query parameter is required (e.g. ?ids=id1,id2)', 400);
    }

    const parseResult = compareQuerySchema.safeParse(rawIds);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse('INVALID_COMPARISON_SELECTION', issue.message, 400);
    }

    const collegeIds = parseResult.data;

    // Fetch colleges by ID with essential comparative metrics
    const colleges = await prisma.college.findMany({
      where: {
        id: { in: collegeIds },
      },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            degree: true,
            duration: true,
            fees: true,
          },
        },
        placements: {
          orderBy: { year: 'desc' },
          take: 1,
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            courses: true,
            placements: true,
            reviews: true,
          },
        },
      },
    });

    if (colleges.length !== collegeIds.length) {
      const foundIds = new Set(colleges.map((c) => c.id));
      const missingIds = collegeIds.filter((id) => !foundIds.has(id));
      return errorResponse(
        'COLLEGE_NOT_FOUND',
        `One or more requested colleges could not be found: ${missingIds.join(', ')}`,
        404
      );
    }

    // Preserve the original ordering from the ids query parameter
    const orderedColleges = collegeIds.map((id) => colleges.find((c) => c.id === id)!);

    return successResponse(orderedColleges);
  } catch (error) {
    console.error('Error comparing colleges:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to generate college comparison', 500);
  }
}
