'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { SortOption } from '@/lib/validations';

interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'rating_asc', label: 'Lowest Rated' },
    { value: 'rank_asc', label: 'National Rank (#1 first)' },
    { value: 'fees_asc', label: 'Fees: Low to High' },
    { value: 'fees_desc', label: 'Fees: High to Low' },
    { value: 'name_asc', label: 'Name (A to Z)' },
    { value: 'name_desc', label: 'Name (Z to A)' },
  ];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        Sort By:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
