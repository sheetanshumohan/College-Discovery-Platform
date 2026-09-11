'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  SlidersHorizontal,
  RefreshCw,
  Compass,
  FileText,
  Infinity as InfinityIcon,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { CollegeSummary } from '@/types';
import { PaginationMeta } from '@/lib/api-response';
import { SortOption } from '@/lib/validations';
import { CollegeCard } from '@/components/colleges/CollegeCard';
import { FilterSidebar, FilterState } from '@/components/colleges/FilterSidebar';
import { SortDropdown } from '@/components/colleges/SortDropdown';
import { Pagination } from '@/components/colleges/Pagination';
import { ActiveFilterChips } from '@/components/colleges/ActiveFilterChips';
import { SkeletonGrid } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

function CollegesDiscoveryContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Parse and manage reactive state for filters, sorting, page, and display mode
  const [search, setSearch] = useState<string | undefined>(() => searchParams.get('search') || undefined);
  const [course, setCourse] = useState<string | undefined>(() => searchParams.get('course') || undefined);
  const [location, setLocation] = useState<string | undefined>(() => searchParams.get('location') || undefined);
  const [minFees, setMinFees] = useState<number | undefined>(() =>
    searchParams.get('minFees') ? Number(searchParams.get('minFees')) : undefined
  );
  const [maxFees, setMaxFees] = useState<number | undefined>(() =>
    searchParams.get('maxFees') ? Number(searchParams.get('maxFees')) : undefined
  );
  const [minRating, setMinRating] = useState<number | undefined>(() =>
    searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined
  );
  const [sort, setSort] = useState<SortOption>(
    () => (searchParams.get('sort') as SortOption) || 'rating_desc'
  );
  const [activePage, setActivePage] = useState<number>(() => {
    const p = searchParams.get('page');
    return p ? Number(p) : 1;
  });
  const [displayMode, setDisplayMode] = useState<'pagination' | 'infinite'>(() => {
    return searchParams.get('mode') === 'infinite' ? 'infinite' : 'pagination';
  });

  // Local data state
  const [colleges, setColleges] = useState<CollegeSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedPage, setLoadedPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Observer sentinel for automatic infinite scrolling
  const observerSentinelRef = useRef<HTMLDivElement>(null);

  // Request counter ref to prevent race conditions and ensure UI updates immediately
  const fetchIdRef = useRef(0);

  // Mobile drawer open/close
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Helper to build URL with updated search params without triggering Next.js router cancellations
  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | undefined | null>) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);

      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === null || val === '') {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      window.history.replaceState(null, '', newUrl);
    },
    [pathname]
  );

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search') || undefined);
      setCourse(params.get('course') || undefined);
      setLocation(params.get('location') || undefined);
      setMinFees(params.get('minFees') ? Number(params.get('minFees')) : undefined);
      setMaxFees(params.get('maxFees') ? Number(params.get('maxFees')) : undefined);
      setMinRating(params.get('minRating') ? Number(params.get('minRating')) : undefined);
      setSort((params.get('sort') as SortOption) || 'rating_desc');
      const p = params.get('page');
      setActivePage(p ? Number(p) : 1);
      setDisplayMode(params.get('mode') === 'infinite' ? 'infinite' : 'pagination');
      setIsLoading(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch colleges from API based on current filters and activePage
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;

    const apiParams = new URLSearchParams();
    if (search) apiParams.set('search', search);
    if (course) apiParams.set('course', course);
    if (location) apiParams.set('location', location);
    if (minFees !== undefined) apiParams.set('minFees', String(minFees));
    if (maxFees !== undefined) apiParams.set('maxFees', String(maxFees));
    if (minRating !== undefined) apiParams.set('minRating', String(minRating));
    if (sort) apiParams.set('sort', sort);
    apiParams.set('page', String(activePage));
    apiParams.set('limit', '12');

    fetch(`/api/colleges?${apiParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return res.json();
      })
      .then(
        (json: {
          data?: CollegeSummary[];
          pagination?: PaginationMeta;
          error?: { message: string };
        }) => {
          if (fetchId === fetchIdRef.current) {
            if (json.data) {
              setColleges(json.data);
              setLoadedPage(activePage);
              if (json.pagination) {
                setPagination(json.pagination);
              }
              setError(null);
            } else {
              setError(json.error?.message || 'Failed to parse response');
            }
            setIsLoading(false);
          }
        }
      )
      .catch((err: unknown) => {
        if (fetchId === fetchIdRef.current) {
          console.error('Error fetching colleges:', err);
          setError(err instanceof Error ? err.message : 'Unable to connect to the server');
          setIsLoading(false);
        }
      });
  }, [
    search,
    course,
    location,
    minFees,
    maxFees,
    minRating,
    sort,
    activePage,
    retryTrigger,
  ]);

  // Handler to load the next page in infinite scroll mode
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || loadedPage >= pagination.totalPages) return;
    setIsLoadingMore(true);

    try {
      const nextPg = loadedPage + 1;
      const apiParams = new URLSearchParams();
      if (search) apiParams.set('search', search);
      if (course) apiParams.set('course', course);
      if (location) apiParams.set('location', location);
      if (minFees !== undefined) apiParams.set('minFees', String(minFees));
      if (maxFees !== undefined) apiParams.set('maxFees', String(maxFees));
      if (minRating !== undefined) apiParams.set('minRating', String(minRating));
      if (sort) apiParams.set('sort', sort);
      apiParams.set('page', String(nextPg));
      apiParams.set('limit', '12');

      const res = await fetch(`/api/colleges?${apiParams.toString()}`);
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const json = await res.json();

      if (json.data) {
        setColleges((prev) => {
          const existing = new Set(prev.map((c) => c.id));
          const fresh = json.data.filter((c: CollegeSummary) => !existing.has(c.id));
          return [...prev, ...fresh];
        });
        setLoadedPage(nextPg);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load more colleges in infinite mode:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    loadedPage,
    pagination.totalPages,
    search,
    location,
    minFees,
    maxFees,
    minRating,
    sort,
  ]);

  // Infinite scroll IntersectionObserver hook
  useEffect(() => {
    if (displayMode !== 'infinite') return;
    if (isLoading || isLoadingMore || loadedPage >= pagination.totalPages) return;

    const sentinel = observerSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [displayMode, isLoading, isLoadingMore, loadedPage, pagination.totalPages, handleLoadMore]);

  const triggerRetry = () => {
    setIsLoading(true);
    setRetryTrigger((prev) => prev + 1);
  };

  // Handler for filter changes from sidebar/drawer
  const handleFilterChange = (newFilters: FilterState) => {
    setIsLoading(true);
    setSearch(newFilters.search);
    setLocation(newFilters.location);
    setMinFees(newFilters.minFees);
    setMaxFees(newFilters.maxFees);
    setMinRating(newFilters.minRating);
    setActivePage(1);
    setLoadedPage(1);
    updateQueryParams({
      search: newFilters.search,
      location: newFilters.location,
      minFees: newFilters.minFees,
      maxFees: newFilters.maxFees,
      minRating: newFilters.minRating,
      page: 1,
    });
  };

  // Handler for removing a single active filter chip
  const handleRemoveFilter = (key: 'search' | 'course' | 'location' | 'minFees' | 'maxFees' | 'minRating') => {
    setIsLoading(true);
    if (key === 'search') setSearch(undefined);
    if (key === 'course') setCourse(undefined);
    if (key === 'location') setLocation(undefined);
    if (key === 'minFees') setMinFees(undefined);
    if (key === 'maxFees') setMaxFees(undefined);
    if (key === 'minRating') setMinRating(undefined);
    setActivePage(1);
    setLoadedPage(1);
    updateQueryParams({
      [key]: undefined,
      page: 1,
    });
  };

  // Handler to reset all filters
  const handleResetAll = () => {
    setIsLoading(true);
    setSearch(undefined);
    setCourse(undefined);
    setLocation(undefined);
    setMinFees(undefined);
    setMaxFees(undefined);
    setMinRating(undefined);
    setSort('rating_desc');
    setActivePage(1);
    setLoadedPage(1);
    updateQueryParams({
      search: undefined,
      course: undefined,
      location: undefined,
      minFees: undefined,
      maxFees: undefined,
      minRating: undefined,
      sort: 'rating_desc',
      page: 1,
    });
  };

  // Handler for sort dropdown changes
  const handleSortChange = (newSort: SortOption) => {
    setIsLoading(true);
    setSort(newSort);
    setActivePage(1);
    setLoadedPage(1);
    updateQueryParams({
      sort: newSort,
      page: 1,
    });
  };

  // Handler for pagination page clicks: update reactive state immediately for instant feedback
  const handlePageChange = (newPage: number) => {
    setIsLoading(true);
    setActivePage(newPage);
    updateQueryParams({
      page: newPage,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for switching between Numbered Pages & Infinite Scroll
  const handleModeChange = (newMode: 'pagination' | 'infinite') => {
    setDisplayMode(newMode);
    if (newMode === 'infinite') {
      updateQueryParams({ mode: 'infinite', page: undefined });
    } else {
      if (colleges.length > 12) {
        setColleges((prev) => prev.slice(0, 12));
      }
      updateQueryParams({ mode: undefined, page: activePage });
    }
  };

  const currentFilters: FilterState = {
    search,
    location,
    minFees,
    maxFees,
    minRating,
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Accredited Institutions Catalog</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore & Compare Universities
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Filter through 108+ universities by tuition, selectivity, and placement outcomes. Compare candidate schools side-by-side.
              </p>
            </div>

            {/* Mobile Filter Drawer Trigger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="gap-2 w-full sm:w-auto"
              >
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Filter Institutions</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sidebar + Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            filters={currentFilters}
            onChange={handleFilterChange}
            onReset={handleResetAll}
            isOpenMobile={isMobileDrawerOpen}
            onCloseMobile={() => setIsMobileDrawerOpen(false)}
          />

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar: Count, Mode Toggle & Sort */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm font-medium text-slate-700">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2 text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Searching database...
                  </span>
                ) : (
                  <span>
                    Found{' '}
                    <strong className="font-bold text-slate-900 font-mono">
                      {pagination.total}
                    </strong>{' '}
                    {pagination.total === 1 ? 'institution' : 'institutions'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
                {/* Pagination / Infinite Scroll Segmented Mode Toggle */}
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium text-slate-600 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleModeChange('pagination')}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all cursor-pointer ${
                      displayMode === 'pagination'
                        ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                    title="Numbered page navigation"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline sm:inline">Pages</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('infinite')}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all cursor-pointer ${
                      displayMode === 'infinite'
                        ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                    title="Continuous scrolling with auto-load"
                  >
                    <InfinityIcon className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline sm:inline">Infinite Scroll</span>
                  </button>
                </div>

                <SortDropdown value={sort} onChange={handleSortChange} />
              </div>
            </div>

            {/* Active Filter Chips */}
            <ActiveFilterChips
              search={search}
              course={course}
              location={location}
              minFees={minFees}
              maxFees={maxFees}
              minRating={minRating}
              onRemove={handleRemoveFilter}
              onResetAll={handleResetAll}
            />

            {/* Infinite Scroll Progress Indicator Bar */}
            {displayMode === 'infinite' && !isLoading && pagination.total > 0 && (
              <div className="mb-5 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
                <span className="font-medium">
                  Showing <strong className="font-bold text-slate-900 font-mono">{colleges.length}</strong> of{' '}
                  <strong className="font-bold text-slate-900 font-mono">{pagination.total}</strong> institutions
                </span>
                <div className="w-full sm:w-56 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((colleges.length / (pagination.total || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Primary Content View: Loading / Error / Empty / Grid */}
            {isLoading ? (
              <div className="py-2">
                <SkeletonGrid count={6} />
              </div>
            ) : error ? (
              <div className="my-6">
                <ErrorState
                  title="Failed to retrieve college listing"
                  message={error}
                  onRetry={triggerRetry}
                />
              </div>
            ) : colleges.length === 0 ? (
              <div className="my-6">
                <EmptyState
                  title="No colleges match your current filters"
                  description="We couldn't find any institutions matching all of your filter parameters. Click below to clear all active filters and return to the complete catalog."
                  actionLabel="Clear filters to view all 108 colleges"
                  onAction={handleResetAll}
                />
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {colleges.map((college) => (
                    <CollegeCard
                      key={college.id}
                      college={college}
                    />
                  ))}
                </div>

                {/* Numbered Pagination Mode */}
                {displayMode === 'pagination' ? (
                  <div className="mt-8">
                    <Pagination
                      pagination={pagination}
                      onPageChange={handlePageChange}
                    />
                  </div>
                ) : (
                  /* Infinite Scroll Mode: Sentinel, Load More Button, & Complete Banner */
                  <div className="mt-8">
                    {/* Sentinel target for automatic IntersectionObserver loading */}
                    <div ref={observerSentinelRef} className="h-4 w-full" aria-hidden="true" />

                    {colleges.length < pagination.total ? (
                      <div className="flex flex-col items-center gap-3 pt-4 pb-8 text-center">
                        <Button
                          variant="outline"
                          size="md"
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="gap-2 px-6 font-semibold shadow-xs hover:border-indigo-300"
                        >
                          {isLoadingMore ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                              <span>Loading more colleges...</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="w-4 h-4 text-slate-500" />
                              <span>
                                Load More Colleges ({pagination.total - colleges.length} remaining)
                              </span>
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-slate-500">
                          Scroll down or click the button to load the next 12 colleges
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 border-t border-slate-200 mt-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          All {pagination.total} institutions loaded
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          You&apos;ve viewed the complete directory for your current filter criteria.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollegesLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="h-28 bg-white rounded-xl border border-slate-200 mb-8 animate-pulse" />
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}

export default function CollegesPage() {
  return (
    <Suspense fallback={<CollegesLoadingFallback />}>
      <CollegesDiscoveryContent />
    </Suspense>
  );
}
