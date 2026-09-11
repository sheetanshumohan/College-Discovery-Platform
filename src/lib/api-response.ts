import { NextResponse } from 'next/server';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(
  data: T,
  status = 200,
  pagination?: PaginationMeta,
  headers?: Record<string, string>
) {
  const init: ResponseInit = { status, headers };
  if (pagination) {
    return NextResponse.json(
      {
        data,
        pagination,
      },
      init
    );
  }
  return NextResponse.json({ data }, init);
}

export function errorResponse(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}
