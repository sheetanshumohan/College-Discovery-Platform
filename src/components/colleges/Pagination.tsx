'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/lib/api-response';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  // Generate page numbers array with intelligent ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200">
      {/* Result Range Information */}
      <div className="text-xs sm:text-sm text-slate-500 font-medium">
        Showing <span className="font-semibold text-slate-900 font-mono">{startIdx}</span> to{' '}
        <span className="font-semibold text-slate-900 font-mono">{endIdx}</span> of{' '}
        <span className="font-semibold text-slate-900 font-mono">{total}</span> institutions
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-xs select-none">
                …
              </span>
            );
          }
          const isCurrent = p === page;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
