import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const loc = (searchParams.get('loc') || '').trim();

    // If searching locations specifically:
    if (loc) {
      const collegesByLoc = await prisma.college.findMany({
        where: {
          OR: [
            { state: { contains: loc, mode: 'insensitive' } },
            { city: { contains: loc, mode: 'insensitive' } },
            { location: { contains: loc, mode: 'insensitive' } },
          ],
        },
        select: {
          city: true,
          state: true,
        },
        distinct: ['city', 'state'],
        take: 6,
      });

      return successResponse({
        locations: collegesByLoc.map((c) => ({
          city: c.city,
          state: c.state,
          label: `${c.city}, ${c.state}`,
        })),
      });
    }

    // Keyword suggestions (college name, city, state)
    const colleges = await prisma.college.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { city: { contains: q, mode: 'insensitive' } },
              { state: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        fees: true,
        rating: true,
        nationalRanking: true,
        type: true,
      },
      orderBy: [
        { nationalRanking: { sort: 'asc', nulls: 'last' } },
        { rating: 'desc' },
      ],
      take: 6,
    });

    return successResponse({
      colleges,
      query: q,
    });
  } catch (error) {
    return errorResponse(
      'SUGGESTIONS_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch suggestions',
      500
    );
  }
}
