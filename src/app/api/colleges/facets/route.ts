import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Single round-trip transaction aggregating facet distribution across all colleges
    const [
      totalColleges,
      countCA,
      countMA,
      countNY,
      countTX,
      countWA,
      countIL,
      countPA,
      countNC,
      rating48,
      rating45,
      rating40,
      fee25k,
      fee40k,
      fee55k,
      fee65k,
      csCount,
      businessCount,
      engineeringCount,
    ] = await prisma.$transaction([
      prisma.college.count(),
      prisma.college.count({ where: { state: { equals: 'CA', mode: 'insensitive' } } }),
      prisma.college.count({ where: { state: { equals: 'MA', mode: 'insensitive' } } }),
      prisma.college.count({ where: { state: { equals: 'NY', mode: 'insensitive' } } }),
      prisma.college.count({ where: { state: { equals: 'TX', mode: 'insensitive' } } }),
      prisma.college.count({ where: { state: { equals: 'WA', mode: 'insensitive' } } }),
      prisma.college.count({ where: { state: { equals: 'IL', mode: 'insensitive' } } }),
      prisma.college.count({ where: { state: { equals: 'PA', mode: 'insensitive' } } }),
      prisma.college.count({ where: { state: { equals: 'NC', mode: 'insensitive' } } }),
      prisma.college.count({ where: { rating: { gte: 4.8 } } }),
      prisma.college.count({ where: { rating: { gte: 4.5 } } }),
      prisma.college.count({ where: { rating: { gte: 4.0 } } }),
      prisma.college.count({ where: { fees: { lte: 25000 } } }),
      prisma.college.count({ where: { fees: { lte: 40000 } } }),
      prisma.college.count({ where: { fees: { lte: 55000 } } }),
      prisma.college.count({ where: { fees: { lte: 65000 } } }),
      prisma.college.count({
        where: { courses: { some: { name: { contains: 'Computer', mode: 'insensitive' } } } },
      }),
      prisma.college.count({
        where: { courses: { some: { name: { contains: 'Business', mode: 'insensitive' } } } },
      }),
      prisma.college.count({
        where: { courses: { some: { name: { contains: 'Engineering', mode: 'insensitive' } } } },
      }),
    ]);

    const facets = {
      total: totalColleges,
      locations: {
        CA: countCA,
        MA: countMA,
        NY: countNY,
        TX: countTX,
        WA: countWA,
        IL: countIL,
        PA: countPA,
        NC: countNC,
      },
      ratings: {
        '4.8': rating48,
        '4.5': rating45,
        '4.0': rating40,
      },
      fees: {
        '25000': fee25k,
        '40000': fee40k,
        '55000': fee55k,
        '65000': fee65k,
      },
      disciplines: {
        'Computer Science': csCount,
        'Business': businessCount,
        'Engineering': engineeringCount,
      },
    };

    return successResponse(facets, 200, undefined, {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    });
  } catch (error) {
    console.error('Error calculating facets:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to calculate facets', 500);
  }
}
