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

// PATCH /api/saved/[collegeId] — Soft-update notes and deadline for an existing saved college
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ collegeId: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required to update saved college', 401);
    }

    const { collegeId } = await context.params;
    if (!collegeId) {
      return errorResponse('INVALID_ID', 'College ID must be provided', 400);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('INVALID_BODY', 'Request body must be valid JSON', 400);
    }

    // Verify record ownership
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

    const notes = typeof body.notes === 'string' ? body.notes.trim() : body.notes === null ? null : existing.notes;
    const deadline = typeof body.deadline === 'string' ? body.deadline.trim() : body.deadline === null ? null : existing.deadline;

    const updated = await prisma.savedCollege.update({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId,
        },
      },
      data: {
        notes,
        deadline,
        updatedAt: new Date(),
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

    return successResponse(updated);
  } catch (error) {
    console.error('Error updating saved college:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to update saved college note or deadline', 500);
  }
}

