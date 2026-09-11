import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ collegeId: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required to remove a saved college', 401);
    }

    const { collegeId } = await context.params;

    if (!collegeId) {
      return errorResponse('INVALID_ID', 'College ID must be provided', 400);
    }

    // Find the saved record for this user and college
    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId,
        },
      },
    });

    if (!existing) {
      return errorResponse('NOT_FOUND', 'This college was not found in your saved list', 404);
    }

    await prisma.savedCollege.delete({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId,
        },
      },
    });

    return successResponse({
      message: 'College successfully removed from saved list',
      collegeId,
    });
  } catch (error) {
    console.error('Error removing saved college:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to remove saved college', 500);
  }
}
