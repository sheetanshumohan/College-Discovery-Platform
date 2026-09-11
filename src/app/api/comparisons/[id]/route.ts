import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// DELETE /api/comparisons/[id] — Remove a saved comparison
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required to delete saved comparison', 401);
    }

    const { id } = await context.params;
    if (!id) {
      return errorResponse('INVALID_PARAM', 'Comparison ID is required', 400);
    }

    const existingComparison = await prisma.savedComparison.findUnique({
      where: { id },
    });

    if (!existingComparison) {
      return errorResponse('NOT_FOUND', 'Comparison set not found', 404);
    }

    if (existingComparison.userId !== user.id) {
      return errorResponse('FORBIDDEN', 'You are not authorized to delete this comparison', 403);
    }

    await prisma.savedComparison.delete({
      where: { id },
    });

    return successResponse({ message: 'Comparison set removed successfully' });
  } catch (error) {
    console.error('Error deleting saved comparison:', error);
    return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to delete saved comparison', 500);
  }
}
