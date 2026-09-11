import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }
  return successResponse({ user });
}
