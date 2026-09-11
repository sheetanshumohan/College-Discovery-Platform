'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Columns3,
  X,
  Plus,
  MapPin,
  Star,
  Scale,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Check,
  Loader2,
  Printer,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';

interface ComparedPlacement {
  id: string;
  year: number;
  averagePackage: number;
  highestPackage: number;
  placementRate: number;
}

interface ComparedCollege {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  description: string;
  fees: number;
  rating: number;
  type: string;
  campusSetting: string;
  nationalRanking?: number | null;
  acceptanceRate?: number | null;
  graduationRate?: number | null;
  studentBodySize?: number | null;
  studentFacultyRatio?: number | null;
  inStateTuition?: number | null;
  outOfStateTuition?: number | null;
  avgFinancialAid?: number | null;
  roomAndBoard?: number | null;
  avgSatScore?: number | null;
  avgActScore?: number | null;
  avgGpa?: number | null;
  applicationDeadline?: string | null;
  websiteUrl?: string | null;
  placements: ComparedPlacement[];
  _count?: {
    courses: number;
    placements: number;
    reviews: number;
  };
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { compareIds, removeFromCompare, clearCompare } = useCompare();

  // Read IDs from searchParams
  const rawIdsParam = searchParams.get('ids');
  const idsFromUrl = rawIdsParam
    ? rawIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Active IDs for query (URL takes priority, falls back to context)
  const activeIds = idsFromUrl.length > 0 ? idsFromUrl : compareIds;

  const [colleges, setColleges] = useState<ComparedCollege[]>([]);
  const [isLoading, setIsLoading] = useState(activeIds.length >= 2);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Save Comparison state
  const { user } = useAuth();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Quick-add 3rd college search state
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [quickSuggestions, setQuickSuggestions] = useState<Array<{ id: string; name: string; city: string; state: string }>>([]);
  const [isQuickSearching, setIsQuickSearching] = useState(false);

  useEffect(() => {
    if (!quickSearchTerm.trim()) {
      setQuickSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsQuickSearching(true);
        const res = await fetch(`/api/colleges/suggestions?q=${encodeURIComponent(quickSearchTerm.trim())}`);
        if (res.ok) {
          const json = await res.json();
          const filtered = (json.data?.colleges || []).filter(
            (c: { id: string }) => !colleges.some((col) => col.id === c.id)
          );
          setQuickSuggestions(filtered);
        }
      } catch (err) {
        console.error('Quick search error:', err);
      } finally {
        setIsQuickSearching(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [quickSearchTerm, colleges]);

  const handleQuickAddCollege = (collegeId: string) => {
    const updatedIds = [...colleges.map((c) => c.id), collegeId];
    setQuickSearchTerm('');
    setQuickSuggestions([]);
    router.push(`/compare?ids=${updatedIds.join(',')}`);
  };

  const handleOpenSaveModal = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setCustomName(colleges.map((c) => c.name).join(' vs '));
    setSaveError(null);
    setIsSaveModalOpen(true);
  };

  const handleSaveComparison = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeIds: colleges.map((c) => c.id),
          name: customName.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to save comparison');
      }

      setSaveSuccess(true);
      setIsSaveModalOpen(false);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error saving comparison');
    } finally {
      setIsSaving(false);
    }
  };

  // Sync URL when context has IDs and URL doesn't
  useEffect(() => {
    if (idsFromUrl.length === 0 && compareIds.length >= 2) {
      router.replace(`/compare?ids=${compareIds.join(',')}`);
    }
  }, [idsFromUrl.length, compareIds, router]);

  // Fetch comparison data when activeIds change
  useEffect(() => {
    if (activeIds.length < 2) {
      return;
    }

    let ignore = false;
    const fetchComparison = async () => {
      try {
        const res = await fetch(`/api/compare?ids=${activeIds.join(',')}`);
        const json = await res.json();

        if (!ignore) {
          if (res.ok && Array.isArray(json.data)) {
            setColleges(json.data);
            setError(null);
          } else {
            setError(json.error?.message || 'Unable to load comparison data');
          }
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Network error loading comparison');
          setIsLoading(false);
        }
      }
    };

    fetchComparison();

    return () => {
      ignore = true;
    };
  }, [activeIds.join(','), retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemoveCollege = (idToRemove: string) => {
    removeFromCompare(idToRemove);
    const updated = activeIds.filter((id) => id !== idToRemove);
    if (updated.length >= 2) {
      router.replace(`/compare?ids=${updated.join(',')}`);
    } else {
      router.replace('/compare');
      setColleges([]);
    }
  };

  const handleClearAll = () => {
    clearCompare();
    router.replace('/compare');
    setColleges([]);
  };

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPercent = (val?: number | null) => {
    if (val === undefined || val === null) return '—';
    const percent = val <= 1 ? val * 100 : val;
    return `${percent.toFixed(1)}%`;
  };

  // Compute clear non-misleading highlights
  const minFees = colleges.length > 0 ? Math.min(...colleges.map((c) => c.fees)) : null;
  const maxRating = colleges.length > 0 ? Math.max(...colleges.map((c) => c.rating)) : null;

  const validAvgPackages = colleges
    .map((c) => c.placements[0]?.averagePackage)
    .filter((pkg): pkg is number => Boolean(pkg));
  const maxAvgPackage = validAvgPackages.length > 0 ? Math.max(...validAvgPackages) : null;

  // Guidance / Empty State (< 2 colleges)
  if (activeIds.length < 2) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50/50">
        <div className="max-w-lg w-full text-center bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Columns3 className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Side-by-Side Comparison Engine
          </h1>

          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Select <strong>2 to 3 colleges</strong> to evaluate tuition fees, placement outcomes, and national rankings side-by-side.
          </p>

          {activeIds.length === 1 && (
            <div className="mb-6 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-medium">
              You currently have 1 college staged in your tray. Select 1 more to unlock comparison.
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/colleges" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full gap-2 shadow-xs">
                <Plus className="w-4 h-4" /> Browse Colleges Directory
              </Button>
            </Link>
            <Link href="/saved" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                Choose from Saved
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <ErrorState
          title="Comparison Failed"
          message={error}
          onRetry={() => {
            setIsLoading(true);
            setRetryCount((prev) => prev + 1);
          }}
        />
        <div className="mt-6 text-center">
          <Link href="/colleges">
            <Button variant="outline" size="sm">
              Back to Colleges Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 bg-white rounded-xl border border-slate-200 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
            <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
            <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1.5 text-xs text-slate-500">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li>
                <Link href="/colleges" className="hover:text-indigo-600 transition-colors font-medium">
                  Colleges
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="font-semibold text-slate-900" aria-current="page">
                Side-by-Side Comparison
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1.5">
                <Scale className="w-3.5 h-3.5" /> Institutional Evaluation
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Comparing {colleges.length} Institutions
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Evaluating tuition, career compensation, admissions selectivity, and completion rates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={saveSuccess ? 'outline' : 'primary'}
                size="sm"
                onClick={handleOpenSaveModal}
                disabled={colleges.length < 2 || isSaving}
                className={`gap-1.5 shadow-xs ${
                  saveSuccess ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved to Profile!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Comparison</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 border-slate-300 print:hidden cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Export PDF</span>
              </Button>

              <Link href="/colleges" className="print:hidden">
                <Button variant="outline" size="sm" className="gap-1.5 border-slate-300">
                  <Plus className="w-3.5 h-3.5" /> Add Another College
                </Button>
              </Link>
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-2 cursor-pointer transition-colors print:hidden"
              >
                Clear Comparison
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Responsive Desktop & Tablet Matrix (Sticky Labels Column + Scrollable Data) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm min-w-[640px]">
              {/* College Card Headers (Sticky on scroll) */}
              <thead className="sticky top-0 z-20 shadow-xs bg-white/95 backdrop-blur-md">
                <tr className="border-b border-slate-200">
                  <th className="p-4 sm:p-5 w-48 sm:w-64 font-bold text-slate-500 uppercase text-xs tracking-wider sticky left-0 top-0 bg-slate-50/98 backdrop-blur-md z-30 border-r border-slate-200">
                    Institution
                  </th>

                  {colleges.map((college) => (
                    <th
                      key={college.id}
                      className="p-4 sm:p-5 w-64 sm:w-80 align-top bg-white/95 backdrop-blur-md border-r border-slate-100 last:border-r-0"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {college.nationalRanking && (
                            <Badge variant="warning">
                              #{college.nationalRanking} National
                            </Badge>
                          )}
                          <Badge variant={college.type === 'PUBLIC' ? 'info' : 'outline'}>
                            {college.type === 'PUBLIC' ? 'Public' : 'Private'}
                          </Badge>
                        </div>

                        <button
                          onClick={() => handleRemoveCollege(college.id)}
                          aria-label={`Remove ${college.name} from comparison`}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer print:hidden"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <Link
                        href={`/colleges/${college.slug}`}
                        className="block font-bold text-base sm:text-lg text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug"
                      >
                        {college.name}
                      </Link>

                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-normal">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{college.location}</span>
                      </div>
                    </th>
                  ))}

                  {/* Interactive Quick-Add 3rd Slot placeholder if only 2 colleges selected */}
                  {colleges.length === 2 && (
                    <th className="p-4 sm:p-5 w-64 sm:w-80 align-top bg-slate-50/40 border-r border-slate-100">
                      <div className="p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-white/90 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-1.5">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">Add 3rd College</span>
                        <p className="text-[11px] text-slate-500 mb-2.5">Search and compare</p>

                        {/* Interactive search box */}
                        <div className="w-full relative">
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-indigo-400 transition-colors">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={quickSearchTerm}
                              onChange={(e) => setQuickSearchTerm(e.target.value)}
                              placeholder="Type college name..."
                              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                            {quickSearchTerm && (
                              <button
                                type="button"
                                onClick={() => setQuickSearchTerm('')}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Quick Suggestions Dropdown */}
                          {quickSearchTerm.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-48 overflow-y-auto text-left divide-y divide-slate-100">
                              {isQuickSearching ? (
                                <div className="p-3 text-[11px] text-slate-500 text-center animate-pulse">
                                  Searching colleges...
                                </div>
                              ) : quickSuggestions.length > 0 ? (
                                quickSuggestions.map((sug) => (
                                  <button
                                    key={sug.id}
                                    type="button"
                                    onClick={() => handleQuickAddCollege(sug.id)}
                                    className="w-full px-3 py-2 text-left hover:bg-indigo-50/80 text-slate-800 text-xs flex flex-col transition-colors cursor-pointer"
                                  >
                                    <span className="font-semibold text-slate-900 truncate">{sug.name}</span>
                                    <span className="text-[10px] text-slate-500">{sug.city}, {sug.state}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-[11px] text-slate-500 text-center">
                                  No colleges found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {/* SECTION: FINANCIALS */}
                <tr className="bg-slate-100/70">
                  <td
                    colSpan={colleges.length + (colleges.length === 2 ? 2 : 1)}
                    className="px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Financial Overview
                  </td>
                </tr>

                {/* Annual Base Tuition */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Annual Tuition & Fees
                  </td>
                  {colleges.map((college) => {
                    const isLowest = minFees !== null && college.fees === minFees;
                    return (
                      <td
                        key={college.id}
                        className="p-4 border-r border-slate-100 last:border-r-0"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
                            {formatCurrency(college.fees)}
                          </span>
                          {isLowest && (
                            <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Lowest
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Estimated base</span>
                      </td>
                    );
                  })}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* In-State / Out-of-State Differential */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    In-State / Out-of-State
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0 text-xs text-slate-700"
                    >
                      <div className="font-mono">
                        <span>In-State: <strong>{formatCurrency(college.inStateTuition)}</strong></span>
                        <br />
                        <span>Out-of-State: <strong>{formatCurrency(college.outOfStateTuition)}</strong></span>
                      </div>
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* Average Financial Aid */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Avg Financial Aid
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0 font-mono text-sm font-semibold text-slate-800"
                    >
                      {formatCurrency(college.avgFinancialAid)}
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* SECTION: ACADEMICS & ADMISSIONS */}
                <tr className="bg-slate-100/70">
                  <td
                    colSpan={colleges.length + (colleges.length === 2 ? 2 : 1)}
                    className="px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Academics & Admissions
                  </td>
                </tr>

                {/* Overall Rating */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Student Rating
                  </td>
                  {colleges.map((college) => {
                    const isHighestRating = maxRating !== null && college.rating === maxRating;
                    return (
                      <td
                        key={college.id}
                        className="p-4 border-r border-slate-100 last:border-r-0"
                      >
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span className="text-base font-bold font-mono text-slate-900">
                            {college.rating.toFixed(1)}
                          </span>
                          {isHighestRating && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              Highest
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* Acceptance Rate */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Acceptance Rate
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0 font-mono text-base font-bold text-indigo-600"
                    >
                      {formatPercent(college.acceptanceRate)}
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* Graduation Rate */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    6-Year Graduation Rate
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0 font-mono text-base font-bold text-emerald-700"
                    >
                      {formatPercent(college.graduationRate)}
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* Faculty Ratio */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Student-to-Faculty
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0 font-mono text-sm text-slate-800"
                    >
                      {college.studentFacultyRatio ? `${college.studentFacultyRatio}:1` : '—'}
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* Undergraduate Body */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Undergrad Enrollment
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0 font-mono text-sm text-slate-800"
                    >
                      {college.studentBodySize ? college.studentBodySize.toLocaleString() : '—'}
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* SECTION: CAREER OUTCOMES */}
                <tr className="bg-slate-100/70">
                  <td
                    colSpan={colleges.length + (colleges.length === 2 ? 2 : 1)}
                    className="px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Career Outcomes (Latest Reported Class)
                  </td>
                </tr>

                {/* Average Package */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Average Salary Package
                  </td>
                  {colleges.map((college) => {
                    const avgPkg = college.placements[0]?.averagePackage;
                    const isHighestPkg = maxAvgPackage !== null && avgPkg === maxAvgPackage;
                    return (
                      <td
                        key={college.id}
                        className="p-4 border-r border-slate-100 last:border-r-0"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
                            {formatCurrency(avgPkg)}
                          </span>
                          {isHighestPkg && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Highest
                            </span>
                          )}
                        </div>
                        {college.placements[0] && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Class of {college.placements[0].year}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* Highest Package */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Highest Recorded Package
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0 font-mono text-base font-bold text-indigo-600"
                    >
                      {formatCurrency(college.placements[0]?.highestPackage)}
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* Placement Rate */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-200">
                    Employment Rate
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0 font-mono text-base font-bold text-emerald-700"
                    >
                      {formatPercent(college.placements[0]?.placementRate)}
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>

                {/* FOOTER ACTIONS */}
                <tr className="bg-slate-50">
                  <td className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                    Action
                  </td>
                  {colleges.map((college) => (
                    <td
                      key={college.id}
                      className="p-4 border-r border-slate-100 last:border-r-0"
                    >
                      <Link href={`/colleges/${college.slug}`}>
                        <Button size="sm" variant="primary" className="w-full gap-1 text-xs">
                          View Full Profile <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  ))}
                  {colleges.length === 2 && <td className="p-4 bg-slate-50/20" />}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Save Comparison Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Bookmark className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">Save Comparison Set</h3>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveComparison} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Comparison Set Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={colleges.map((c) => c.name).join(' vs ')}
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">
                  Give this comparison a title or keep the default name.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Included Institutions ({colleges.length})
                </label>
                <div className="space-y-1.5">
                  {colleges.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <span className="font-semibold text-slate-800 truncate">{c.name}</span>
                      <span className="text-slate-500 font-mono">
                        {c.nationalRanking ? `#${c.nationalRanking}` : c.city}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg">
                  {saveError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="gap-1.5 shadow-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Comparison</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Save Success Banner */}
      {saveSuccess && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-100">Comparison Saved Successfully</p>
            <Link
              href="/saved?tab=comparisons"
              className="text-xs text-emerald-300 hover:text-white underline font-medium inline-flex items-center gap-1"
            >
              View in Saved Comparisons →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-20 bg-white rounded-xl border border-slate-200 mb-8 animate-pulse" />
            <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
