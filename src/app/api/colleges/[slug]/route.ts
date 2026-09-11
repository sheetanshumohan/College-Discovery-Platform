import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug || typeof slug !== 'string') {
      return errorResponse('INVALID_SLUG', 'A valid college slug must be provided', 400);
    }

    // Slug normalization: handle special characters, uri-encoding, uppercase
    const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();

    const college = await prisma.college.findUnique({
      where: { slug: normalizedSlug },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            degree: true,
            duration: true,
            fees: true,
          },
          orderBy: { name: 'asc' },
        },
        placements: {
          select: {
            id: true,
            year: true,
            averagePackage: true,
            highestPackage: true,
            placementRate: true,
          },
          orderBy: { year: 'desc' },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!college) {
      return errorResponse('NOT_FOUND', `College with slug "${slug}" not found`, 404);
    }

    return successResponse(
      college,
      200,
      undefined,
      {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    );
  } catch (error) {
    console.error('Error fetching college detail:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve college details', 500);
  }
}
