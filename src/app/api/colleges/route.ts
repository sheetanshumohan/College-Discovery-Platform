import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { collegeQuerySchema, SortOption } from '@/lib/validations';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryObj = {
      search: searchParams.get('search') || undefined,
      course: searchParams.get('course') || undefined,
      location: searchParams.get('location') || undefined,
      minFees: searchParams.get('minFees') || undefined,
      maxFees: searchParams.get('maxFees') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const parseResult = collegeQuerySchema.safeParse(queryObj);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse('INVALID_PARAMETERS', issue.message, 400, parseResult.error.flatten());
    }

    const { search, course, location, minFees, maxFees, minRating, sort, page, limit } = parseResult.data;

    // Build database-level where clause for Prisma
    const where: Prisma.CollegeWhereInput = {
      AND: [],
    };

    const andConditions = where.AND as Prisma.CollegeWhereInput[];

    if (course) {
      andConditions.push({
        courses: {
          some: {
            name: { contains: course, mode: 'insensitive' },
          },
        },
      });
    }

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (location) {
      const trimmedLoc = location.trim();
      if (trimmedLoc.length === 2) {
        andConditions.push({
          state: { equals: trimmedLoc.toUpperCase(), mode: 'insensitive' },
        });
      } else {
        andConditions.push({
          OR: [
            { location: { contains: trimmedLoc, mode: 'insensitive' } },
            { city: { contains: trimmedLoc, mode: 'insensitive' } },
            { state: { equals: trimmedLoc.toUpperCase(), mode: 'insensitive' } },
          ],
        });
      }
    }

    if (minFees !== undefined || maxFees !== undefined) {
      andConditions.push({
        fees: {
          ...(minFees !== undefined ? { gte: minFees } : {}),
          ...(maxFees !== undefined ? { lte: maxFees } : {}),
        },
      });
    }

    if (minRating !== undefined) {
      andConditions.push({
        rating: { gte: minRating },
      });
    }

    // Build safe predefined sorting options
    let orderBy: Prisma.CollegeOrderByWithRelationInput = { rating: 'desc' };
    switch (sort as SortOption) {
      case 'rating_desc':
        orderBy = { rating: 'desc' };
        break;
      case 'rating_asc':
        orderBy = { rating: 'asc' };
        break;
      case 'fees_asc':
        orderBy = { fees: 'asc' };
        break;
      case 'fees_desc':
        orderBy = { fees: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'rank_asc':
        orderBy = { nationalRanking: 'asc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    const skip = (page - 1) * limit;

    // Database-level count and paginated query in a single roundtrip transaction
    const [total, colleges] = await prisma.$transaction([
      prisma.college.count({ where }),
      prisma.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          studentBodySize: true,
          studentFacultyRatio: true,
          inStateTuition: true,
          outOfStateTuition: true,
          avgFinancialAid: true,
          roomAndBoard: true,
          avgSatScore: true,
          avgActScore: true,
          avgGpa: true,
          applicationDeadline: true,
          websiteUrl: true,
          logoUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              courses: true,
              placements: true,
              reviews: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return successResponse(
      colleges,
      200,
      {
        page,
        limit,
        total,
        totalPages,
      },
      {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    );
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve college listing', 500);
  }
}
