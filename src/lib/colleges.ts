import { cache } from 'react';
import prisma from '@/lib/prisma';

export const getCollegeBySlug = cache(async (slug: string) => {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();

  try {
    const college = await prisma.college.findUnique({
      where: { slug: normalizedSlug },
      include: {
        courses: {
          select: {
            id: true,
            collegeId: true,
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
            collegeId: true,
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
            collegeId: true,
            userId: true,
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

    return college;
  } catch (error) {
    console.error('Error fetching college in getCollegeBySlug:', error);
    return null;
  }
});
