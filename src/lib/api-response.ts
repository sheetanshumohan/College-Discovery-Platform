import { NextResponse } from 'next/server';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(data: T, status = 200, pagination?: PaginationMeta) {
  if (pagination) {
    return NextResponse.json(
      {
        data,
        pagination,
      },
      { status }
    );
  }
  return NextResponse.json({ data }, { status });
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
