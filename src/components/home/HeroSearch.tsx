'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Star,
  Building2,
  TrendingUp,
  X,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CollegeSuggestion {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  fees: number;
  rating: number;
  nationalRanking: number | null;
  type: string;
}

interface LocationSuggestion {
  city: string;
  state: string;
  label: string;
}

const POPULAR_MAJORS = [
  'Computer Science',
  'Data Science & AI',
  'Mechanical Engineering',
  'Business Administration',
  'Biomedical Sciences',
  'Economics',
];

const POPULAR_LOCATIONS = [
  { label: 'California (CA)', value: 'CA' },
  { label: 'Massachusetts (MA)', value: 'MA' },
  { label: 'New York (NY)', value: 'NY' },
  { label: 'Texas (TX)', value: 'TX' },
  { label: 'Illinois (IL)', value: 'IL' },
  { label: 'Washington (WA)', value: 'WA' },
];

export function HeroSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');

  // Dropdown visibility states
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Suggestions data
  const [collegeSuggestions, setCollegeSuggestions] = useState<CollegeSuggestion[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocSearching, setIsLocSearching] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Debounced college fetch
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const url = searchTerm.trim()
          ? `/api/colleges/suggestions?q=${encodeURIComponent(searchTerm.trim())}`
          : `/api/colleges/suggestions`;
        const res = await fetch(url);
        if (res.ok && active) {
          const json = await res.json();
          setCollegeSuggestions(json.data?.colleges || []);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        if (active) setIsSearching(false);
      }
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Debounced location fetch
  useEffect(() => {
    let active = true;
    if (!locationTerm.trim()) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLocSearching(true);
        const res = await fetch(
          `/api/colleges/suggestions?loc=${encodeURIComponent(locationTerm.trim())}`
        );
        if (res.ok && active) {
          const json = await res.json();
          setLocationSuggestions(json.data?.locations || []);
        }
      } catch (err) {
        console.error('Error fetching location suggestions:', err);
      } finally {
        if (active) setIsLocSearching(false);
      }
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [locationTerm]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSearchDropdown(false);
    setShowLocationDropdown(false);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (locationTerm.trim()) params.set('location', locationTerm.trim());
    router.push(`/colleges?${params.toString()}`);
  };

  const handleSelectCollege = (slug: string) => {
    setShowSearchDropdown(false);
    router.push(`/colleges/${slug}`);
  };

  const handleSelectMajor = (major: string) => {
    setSearchTerm(major);
    setShowSearchDropdown(false);
    const params = new URLSearchParams();
    params.set('search', major);
    if (locationTerm.trim()) params.set('location', locationTerm.trim());
    router.push(`/colleges?${params.toString()}`);
  };

  const handleSelectLocation = (loc: string) => {
    setLocationTerm(loc);
    setShowLocationDropdown(false);
  };

  // Keyboard navigation for search suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown || collegeSuggestions.length === 0) {
      if (e.key === 'Enter') handleSearch();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < collegeSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : collegeSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < collegeSuggestions.length) {
        handleSelectCollege(collegeSuggestions[activeSuggestionIndex].slug);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  const quickFilters = [
    { label: 'Top 25 National', query: 'sort=rank_asc' },
    { label: 'Affordable (< $15k)', query: 'maxFees=15000&sort=fees_asc' },
    { label: 'California', query: 'location=CA' },
    { label: 'Massachusetts', query: 'location=MA' },
    { label: 'New York', query: 'location=NY' },
    { label: 'Texas', query: 'location=TX' },
  ];

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto relative z-30">
      {/* Primary Search Form Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500 relative z-30"
      >
        {/* Keyword Search Input */}
        <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 focus-within:bg-white focus-within:border-indigo-400 transition-colors relative">
          <Search className="w-4 h-4 text-indigo-500 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchDropdown(true);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={() => {
              setShowSearchDropdown(true);
              setShowLocationDropdown(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search by university name, major, or keyword..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showSearchDropdown}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Location Input */}
        <div className="sm:w-56 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 focus-within:bg-white focus-within:border-indigo-400 transition-colors relative">
          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
          <input
            ref={locationInputRef}
            type="text"
            value={locationTerm}
            onChange={(e) => {
              setLocationTerm(e.target.value);
              setShowLocationDropdown(true);
            }}
            onFocus={() => {
              setShowLocationDropdown(true);
              setShowSearchDropdown(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
              if (e.key === 'Escape') setShowLocationDropdown(false);
            }}
            placeholder="City or state (e.g. CA)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoComplete="off"
          />
          {locationTerm && (
            <button
              type="button"
              onClick={() => {
                setLocationTerm('');
                locationInputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Submit Button */}
        <Button
          type="submit"
          size="md"
          variant="primary"
          className="rounded-xl px-5 gap-2 shrink-0 justify-center h-11 sm:h-auto font-medium shadow-md shadow-indigo-600/20"
        >
          <span>Find Colleges</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* ── KEYWORD SUGGESTIONS DROPDOWN ── */}
      {showSearchDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 sm:right-56 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Title */}
          <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
              {searchTerm.trim() ? (
                <>
                  <Search className="w-3.5 h-3.5" />
                  Matching Institutions
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  Top Ranked Institutions
                </>
              )}
            </span>
            {isSearching && (
              <span className="text-[11px] text-indigo-600 font-medium animate-pulse">
                Searching...
              </span>
            )}
          </div>

          {/* College Items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {collegeSuggestions.length > 0 ? (
              collegeSuggestions.map((col, index) => {
                const isSelected = index === activeSuggestionIndex;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleSelectCollege(col.slug)}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/80 text-indigo-950' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100/70 border border-indigo-200/60 text-indigo-700 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">
                          {col.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {col.city}, {col.state}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">
                            ${col.fees.toLocaleString()}/yr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {col.nationalRanking && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          #{col.nationalRanking} Nat.
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {col.rating.toFixed(1)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                {isSearching ? 'Searching colleges...' : `No colleges matching "${searchTerm}"`}
              </div>
            )}
          </div>

          {/* Popular Majors / Programs Section */}
          <div className="p-3 bg-slate-50/70 border-t border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1 px-1">
              <BookOpen className="w-3 h-3 text-indigo-500" />
              Popular Academic Fields
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_MAJORS.map((major) => (
                <button
                  key={major}
                  type="button"
                  onClick={() => handleSelectMajor(major)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer"
                >
                  {major}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          {searchTerm.trim() && (
            <button
              type="button"
              onClick={() => handleSearch()}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View all search results for &ldquo;{searchTerm}&rdquo;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── LOCATION SUGGESTIONS DROPDOWN ── */}
      {showLocationDropdown && (
        <div className="absolute top-[calc(100%+8px)] right-0 sm:w-80 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              {locationTerm.trim() ? 'Matching Locations' : 'Popular States'}
            </span>
            {isLocSearching && (
              <span className="text-[11px] text-emerald-600 font-medium animate-pulse">
                Finding...
              </span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {locationTerm.trim() ? (
              locationSuggestions.length > 0 ? (
                locationSuggestions.map((loc) => (
                  <button
                    key={`${loc.city}-${loc.state}`}
                    type="button"
                    onClick={() => handleSelectLocation(`${loc.city}, ${loc.state}`)}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/60 text-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer text-sm"
                  >
                    <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-900">{loc.city}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                      {loc.state}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-5 text-center text-sm text-slate-500">
                  {isLocSearching ? 'Finding locations...' : `No locations matching "${locationTerm}"`}
                </div>
              )
            ) : (
              <div className="p-2 space-y-1">
                {POPULAR_LOCATIONS.map((ploc) => (
                  <button
                    key={ploc.value}
                    type="button"
                    onClick={() => handleSelectLocation(ploc.value)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50/70 text-slate-800 flex items-center justify-between transition-colors cursor-pointer text-sm"
                  >
                    <span className="font-medium text-slate-900">{ploc.label}</span>
                    <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                      {ploc.value}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Search Badges */}
      <div className="mt-4 flex items-center gap-2 flex-wrap justify-center text-xs">
        <span className="text-slate-500 flex items-center gap-1 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Popular:
        </span>
        {quickFilters.map((qf) => (
          <button
            key={qf.label}
            type="button"
            onClick={() => router.push(`/colleges?${qf.query}`)}
            className="bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs transition-all cursor-pointer"
          >
            {qf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
