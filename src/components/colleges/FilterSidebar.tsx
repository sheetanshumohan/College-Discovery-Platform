'use client';

import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Search,
  MapPin,
  DollarSign,
  Star,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface FilterState {
  search?: string;
  location?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const POPULAR_LOCATIONS = [
  { code: '', label: 'All' },
  { code: 'CA', label: 'California' },
  { code: 'MA', label: 'Massachusetts' },
  { code: 'NY', label: 'New York' },
  { code: 'TX', label: 'Texas' },
  { code: 'WA', label: 'Washington' },
  { code: 'IL', label: 'Illinois' },
  { code: 'PA', label: 'Pennsylvania' },
  { code: 'NC', label: 'North Carolina' },
];

const RATING_OPTIONS = [
  { value: undefined, label: 'All Ratings' },
  { value: 4.0, label: '4.0+ Stars' },
  { value: 4.5, label: '4.5+ Stars' },
  { value: 4.8, label: '4.8+ Stars' },
];

const FEE_PRESETS = [
  { label: 'Any', max: undefined },
  { label: '< $25k', max: 25000 },
  { label: '< $40k', max: 40000 },
  { label: '< $55k', max: 55000 },
  { label: '< $65k', max: 65000 },
];

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  isOpenMobile = false,
  onCloseMobile,
}: FilterSidebarProps) {
  // Local state for debounced search text
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [locationInput, setLocationInput] = useState(filters.location || '');

  // Synchronize during render when external props change
  const [prevSearchProp, setPrevSearchProp] = useState(filters.search);
  const [prevLocationProp, setPrevLocationProp] = useState(filters.location);

  if (filters.search !== prevSearchProp) {
    setPrevSearchProp(filters.search);
    setSearchInput(filters.search || '');
  }

  if (filters.location !== prevLocationProp) {
    setPrevLocationProp(filters.location);
    setLocationInput(filters.location || '');
  }

  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const locationTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
    };
  }, []);

  const handleSearchInputChange = (val: string) => {
    setSearchInput(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      onChange({
        ...filters,
        search: val.trim() ? val.trim() : undefined,
      });
    }, 400);
  };

  const handleLocationInputChange = (val: string) => {
    setLocationInput(val);
    if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
    locationTimerRef.current = setTimeout(() => {
      onChange({
        ...filters,
        location: val.trim() ? val.trim() : undefined,
      });
    }, 400);
  };

  const hasFiltersActive = Boolean(
    filters.search ||
    filters.location ||
    filters.minFees !== undefined ||
    filters.maxFees !== undefined ||
    filters.minRating !== undefined
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  const filterContent = (
    <div className="space-y-6">
      {/* Search Input Section */}
      <div>
        <label
          htmlFor="filter-search"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          Keyword Search
        </label>
        <div className="relative">
          <input
            id="filter-search"
            type="text"
            placeholder="Name, city, or discipline..."
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onChange({ ...filters, search: undefined });
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Location Section */}
      <div>
        <label
          htmlFor="filter-location"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
        >
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          State or City
        </label>
        <div className="relative mb-3">
          <input
            id="filter-location"
            type="text"
            placeholder="e.g. CA, Boston, Texas..."
            value={locationInput}
            onChange={(e) => handleLocationInputChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {locationInput && (
            <button
              onClick={() => {
                setLocationInput('');
                onChange({ ...filters, location: undefined });
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear location input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Location Pills */}
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_LOCATIONS.map((loc) => {
            const isSelected =
              (!filters.location && loc.code === '') ||
              filters.location?.toUpperCase() === loc.code;
            return (
              <button
                key={loc.code || 'all'}
                type="button"
                onClick={() => {
                  const newLoc = loc.code || undefined;
                  setLocationInput(newLoc || '');
                  onChange({ ...filters, location: newLoc });
                }}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {loc.code || loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Maximum Annual Tuition / Fees */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="filter-max-fees"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            Max Annual Tuition
          </label>
          <span className="text-xs font-bold font-mono text-indigo-600">
            {filters.maxFees !== undefined ? formatCurrency(filters.maxFees) : 'Any'}
          </span>
        </div>

        {/* Slider */}
        <input
          id="filter-max-fees"
          type="range"
          min="15000"
          max="70000"
          step="2500"
          value={filters.maxFees || 70000}
          onChange={(e) => {
            const val = Number(e.target.value);
            onChange({
              ...filters,
              maxFees: val >= 70000 ? undefined : val,
            });
          }}
          className="w-full accent-indigo-600 cursor-pointer mb-2"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>$15k</span>
          <span>$35k</span>
          <span>$50k</span>
          <span>$70k+</span>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {FEE_PRESETS.map((preset) => {
            const isSelected = filters.maxFees === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ ...filters, maxFees: preset.max })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="pt-4 border-t border-slate-200">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          <Star className="w-3.5 h-3.5 text-slate-400" />
          Minimum Rating
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = filters.minRating === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange({ ...filters, minRating: opt.value })}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Action */}
      {hasFiltersActive && (
        <div className="pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full text-slate-600 hover:text-slate-900 border-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar Panel */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-20 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Filters</h2>
            </div>
            {hasFiltersActive && (
              <button
                onClick={onReset}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer Sheet */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Filter Colleges</h2>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                aria-label="Close filter drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {filterContent}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
              {hasFiltersActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onReset();
                    onCloseMobile?.();
                  }}
                  className="flex-1"
                >
                  Reset
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={onCloseMobile}
                className="flex-1"
              >
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
