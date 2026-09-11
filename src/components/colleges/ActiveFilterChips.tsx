'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';

interface ActiveFilterChipsProps {
  search?: string;
  location?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  onRemove: (key: 'search' | 'location' | 'minFees' | 'maxFees' | 'minRating') => void;
  onResetAll: () => void;
}

export function ActiveFilterChips({
  search,
  location,
  minFees,
  maxFees,
  minRating,
  onRemove,
  onResetAll,
}: ActiveFilterChipsProps) {
  const hasActiveFilters = Boolean(
    search || location || minFees !== undefined || maxFees !== undefined || minRating !== undefined
  );

  if (!hasActiveFilters) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="flex items-center gap-2 flex-wrap py-2.5">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Active Filters:
      </span>

      {search && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
          Search: &ldquo;{search}&rdquo;
          <button
            onClick={() => onRemove('search')}
            aria-label="Remove search filter"
            className="hover:text-indigo-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {location && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
          Location: {location}
          <button
            onClick={() => onRemove('location')}
            aria-label="Remove location filter"
            className="hover:text-indigo-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {minFees !== undefined && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
          Min Fees: {formatCurrency(minFees)}
          <button
            onClick={() => onRemove('minFees')}
            aria-label="Remove minimum fees filter"
            className="hover:text-indigo-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {maxFees !== undefined && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
          Max Fees: {formatCurrency(maxFees)}
          <button
            onClick={() => onRemove('maxFees')}
            aria-label="Remove maximum fees filter"
            className="hover:text-indigo-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {minRating !== undefined && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
          Rating: {minRating}+ Stars
          <button
            onClick={() => onRemove('minRating')}
            aria-label="Remove rating filter"
            className="hover:text-indigo-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      <button
        onClick={onResetAll}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Reset All
      </button>
    </div>
  );
}
