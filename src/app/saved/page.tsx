'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bookmark,
  Trash2,
  MapPin,
  Star,
  ArrowRight,
  Plus,
  Check,
  Scale,
  LogIn,
  Search,
  Columns3,
  Calendar,
  Pencil,
  Clock,
  X,
  FileEdit,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import { useSaved } from '@/context/SavedContext';
import { CollegeSummary } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGrid } from '@/components/ui/LoadingSkeleton';

interface SavedItemRecord {
  id: string;
  userId: string;
  collegeId: string;
  notes?: string | null;
  deadline?: string | null;
  createdAt: string;
  updatedAt?: string;
  college: CollegeSummary & { applicationDeadline?: string | null };
}

interface SavedComparisonRecord {
  id: string;
  userId: string;
  name: string;
  collegeIds: string[];
  colleges: CollegeSummary[];
  createdAt: string;
}

function SavedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isInCompare, toggleCompare, isMaxReached, addToCompare, clearCompare } = useCompare();
  const { removeSaved } = useSaved();

  const [activeTab, setActiveTab] = useState<'colleges' | 'comparisons'>(() => {
    return searchParams?.get('tab') === 'comparisons' ? 'comparisons' : 'colleges';
  });

  // Saved Colleges state
  const [savedItems, setSavedItems] = useState<SavedItemRecord[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByDeadline, setSortByDeadline] = useState(false);

  // Inline Note & Deadline Editing state
  const [editingItem, setEditingItem] = useState<SavedItemRecord | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [isUpdatingRecord, setIsUpdatingRecord] = useState(false);

  // Saved Comparisons state
  const [savedComparisons, setSavedComparisons] = useState<SavedComparisonRecord[]>([]);
  const [isComparisonsLoading, setIsComparisonsLoading] = useState(true);
  const [deletingComparisonId, setDeletingComparisonId] = useState<string | null>(null);

  // Fetch saved colleges
  useEffect(() => {
    if (!user) return;

    let ignore = false;
    fetch('/api/saved')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data?: SavedItemRecord[] } | null) => {
        if (!ignore) {
          if (json?.data) {
            setSavedItems(json.data);
          }
          setIsDataLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error fetching saved colleges:', err);
          setIsDataLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  // Fetch saved comparisons
  useEffect(() => {
    if (!user) return;

    let ignore = false;
    fetch('/api/comparisons')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data?: SavedComparisonRecord[] } | null) => {
        if (!ignore) {
          if (json?.data) {
            setSavedComparisons(json.data);
          }
          setIsComparisonsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error fetching saved comparisons:', err);
          setIsComparisonsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  const handleRemove = async (collegeId: string) => {
    setRemovingId(collegeId);
    const previous = [...savedItems];
    setSavedItems((prev) => prev.filter((item) => item.collegeId !== collegeId));

    try {
      const ok = await removeSaved(collegeId);
      if (!ok) {
        setSavedItems(previous);
      }
    } catch {
      setSavedItems(previous);
    } finally {
      setRemovingId(null);
    }
  };

  const handleDeleteComparison = async (comparisonId: string) => {
    setDeletingComparisonId(comparisonId);
    const previous = [...savedComparisons];
    setSavedComparisons((prev) => prev.filter((item) => item.id !== comparisonId));

    try {
      const res = await fetch(`/api/comparisons/${comparisonId}`, { method: 'DELETE' });
      if (!res.ok) {
        setSavedComparisons(previous);
      }
    } catch {
      setSavedComparisons(previous);
    } finally {
      setDeletingComparisonId(null);
    }
  };

  const handleLaunchComparison = (item: SavedComparisonRecord) => {
    clearCompare();
    item.colleges.forEach((c) => {
      addToCompare(c.id, c.name);
    });
    router.push(`/compare?ids=${item.collegeIds.join(',')}`);
  };

  const handleCompareAll = () => {
    savedItems.slice(0, 3).forEach((item) => {
      addToCompare(item.collegeId, item.college.name);
    });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return 'Recently saved';
    }
  };

  const handleOpenEdit = (item: SavedItemRecord) => {
    setEditingItem(item);
    setEditNotes(item.notes || '');
    setEditDeadline(item.deadline || item.college.applicationDeadline || '');
  };

  const handleSaveNote = async () => {
    if (!editingItem) return;
    setIsUpdatingRecord(true);
    try {
      const res = await fetch(`/api/saved/${editingItem.collegeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes, deadline: editDeadline }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSavedItems((prev) =>
            prev.map((item) =>
              item.collegeId === editingItem.collegeId
                ? {
                    ...item,
                    notes: json.data.notes,
                    deadline: json.data.deadline,
                    updatedAt: json.data.updatedAt,
                  }
                : item
            )
          );
        }
        setEditingItem(null);
      }
    } catch (err) {
      console.error('Failed to update note:', err);
    } finally {
      setIsUpdatingRecord(false);
    }
  };

  // Filter and sort saved items
  const filteredItems = React.useMemo(() => {
    const items = savedItems.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.college.name.toLowerCase().includes(q) ||
        item.college.location.toLowerCase().includes(q) ||
        (item.college.city && item.college.city.toLowerCase().includes(q)) ||
        (item.college.state && item.college.state.toLowerCase().includes(q))
      );
    });

    if (!sortByDeadline) return items;

    return [...items].sort((a, b) => {
      const deadA = a.deadline || a.college.applicationDeadline;
      const deadB = b.deadline || b.college.applicationDeadline;
      if (!deadA && !deadB) return 0;
      if (!deadA) return 1;
      if (!deadB) return -1;
      return new Date(deadA).getTime() - new Date(deadB).getTime();
    });
  }, [savedItems, searchQuery, sortByDeadline]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-24 bg-white rounded-xl border border-slate-200 mb-8 animate-pulse" />
          <SkeletonGrid count={3} />
        </div>
      </div>
    );
  }

  // Unauthenticated State
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50/50">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Bookmark className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Sign In to View Saved Collections
          </h1>

          <p className="text-sm text-slate-600 mb-8 leading-relaxed">
            Create an account or sign in to curate your personal target shortlist, save multi-college comparisons, and track tuition metrics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login?redirect=/saved" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full gap-2 shadow-xs">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            </Link>
            <Link href="/signup?redirect=/saved" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-2">
                <Bookmark className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                Personal Academic Collections
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Saved Portfolios
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your bookmarked institutions and saved side-by-side comparison sets.
              </p>
            </div>

            {activeTab === 'colleges' && savedItems.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompareAll}
                  className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Scale className="w-4 h-4 text-indigo-600" />
                  Compare Top {Math.min(savedItems.length, 3)}
                </Button>
                <Link href="/colleges">
                  <Button variant="primary" size="sm" className="gap-1.5 shadow-xs">
                    <Plus className="w-4 h-4" /> Discover More
                  </Button>
                </Link>
              </div>
            )}

            {activeTab === 'comparisons' && (
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/compare">
                  <Button variant="primary" size="sm" className="gap-1.5 shadow-xs">
                    <Scale className="w-4 h-4" /> New Comparison
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Segmented Navigation Tab Switcher */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('colleges')}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'colleges'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Colleges</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'colleges'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {savedItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('comparisons')}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'comparisons'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-4 h-4" />
              <span>Saved Comparisons</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'comparisons'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {savedComparisons.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: SAVED COLLEGES */}
        {activeTab === 'colleges' && (
          <div>
            {isDataLoading ? (
              <SkeletonGrid count={3} />
            ) : savedItems.length === 0 ? (
              <div className="my-8">
                <EmptyState
                  title="Your Shortlist is Empty"
                  description="You haven't saved any colleges to your favorites yet. Search top-ranked universities, filter by tuition, and bookmark your top choices."
                  actionLabel="Explore Colleges"
                  onAction={() => router.push('/colleges')}
                  icon={<Bookmark className="w-8 h-8 text-slate-400" />}
                />
              </div>
            ) : (
              <div>
                {/* Toolbar & Filter */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm font-medium text-slate-700">
                    Showing{' '}
                    <strong className="font-bold text-slate-900 font-mono">
                      {filteredItems.length}
                    </strong>{' '}
                    {filteredItems.length === 1 ? 'saved college' : 'saved colleges'}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSortByDeadline(!sortByDeadline)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        sortByDeadline
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sort by closest deadline</span>
                    </button>

                    {savedItems.length > 1 && (
                      <div className="relative w-full sm:w-60">
                        <input
                          type="text"
                          placeholder="Search in saved..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Saved Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => {
                    const college = item.college;
                    const inCompare = isInCompare(college.id);
                    const isRemoving = removingId === college.id;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative group ${
                          isRemoving ? 'opacity-40 pointer-events-none' : ''
                        }`}
                      >
                        {/* Card Header Banner with Quick Removal & Inline Edit */}
                        <div className="p-5 pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                {college.nationalRanking && (
                                  <Badge variant="info" size="sm">
                                    #{college.nationalRanking} in US
                                  </Badge>
                                )}
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                  {college.type === 'PUBLIC' ? 'Public' : 'Private'}
                                </span>
                              </div>

                              <Link href={`/colleges/${college.slug}`}>
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                  {college.name}
                                </h3>
                              </Link>

                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {college.city ? `${college.city}, ${college.state}` : college.location}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                aria-label={`Edit notes and deadline for ${college.name}`}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit notes & application deadline"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemove(college.id)}
                                disabled={isRemoving}
                                aria-label={`Remove ${college.name} from saved list`}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove from saved"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-xs">
                            <span className="flex items-center gap-1 font-bold text-slate-900 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {college.rating.toFixed(1)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Saved on {formatDate(item.createdAt)}
                            </span>
                          </div>

                          {/* Deadline & Note display */}
                          {(item.deadline || college.applicationDeadline) && (
                            <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-md mt-2.5">
                              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>
                                App Deadline:{' '}
                                <strong className="font-semibold">
                                  {item.deadline || college.applicationDeadline}
                                </strong>
                              </span>
                            </div>
                          )}

                          {item.notes && (
                            <div className="mt-2.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/70 p-2.5 rounded-lg italic">
                              &ldquo;{item.notes}&rdquo;
                              {item.updatedAt && (
                                <span className="block not-italic text-[10px] text-slate-400 mt-1">
                                  Notes updated {formatDate(item.updatedAt)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Metrics Strip */}
                        <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100 grid grid-cols-2 gap-2 text-center">
                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                              Annual Fees
                            </span>
                            <span className="block text-sm font-bold font-mono text-slate-900 mt-0.5">
                              {formatCurrency(college.fees)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                              Acceptance Rate
                            </span>
                            <span className="block text-sm font-bold font-mono text-indigo-600 mt-0.5">
                              {college.acceptanceRate
                                ? `${(college.acceptanceRate * 100).toFixed(0)}%`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-4 pt-3 flex items-center justify-between gap-3 bg-white">
                          <button
                            type="button"
                            onClick={() => toggleCompare(college.id, college.name)}
                            disabled={!inCompare && isMaxReached}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                              inCompare
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : isMaxReached
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {inCompare ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> In Compare
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Compare
                              </>
                            )}
                          </button>

                          <Link
                            href={`/colleges/${college.slug}`}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                          >
                            View Details <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED COMPARISONS */}
        {activeTab === 'comparisons' && (
          <div>
            {isComparisonsLoading ? (
              <SkeletonGrid count={2} />
            ) : savedComparisons.length === 0 ? (
              <div className="my-8">
                <EmptyState
                  title="No Saved Comparisons Yet"
                  description="When evaluating universities on the Compare Engine, click 'Save Comparison' to store side-by-side benchmark sets here for instant recall."
                  actionLabel="Go to Compare Engine"
                  onAction={() => router.push('/compare')}
                  icon={<Columns3 className="w-8 h-8 text-slate-400" />}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-sm font-medium text-slate-700">
                  You have{' '}
                  <strong className="font-bold text-slate-900 font-mono">
                    {savedComparisons.length}
                  </strong>{' '}
                  saved comparison {savedComparisons.length === 1 ? 'set' : 'sets'}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {savedComparisons.map((item) => {
                    const isDeleting = deletingComparisonId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                          isDeleting ? 'opacity-40 pointer-events-none' : ''
                        }`}
                      >
                        <div>
                          {/* Card Header with Title and Delete Button */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Saved on {formatDate(item.createdAt)}</span>
                              </div>
                              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                {item.name || 'University Comparison'}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteComparison(item.id)}
                              disabled={isDeleting}
                              aria-label={`Delete comparison set ${item.name}`}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete comparison"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Preview Grid of the 2-3 Compared Colleges */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                            {item.colleges.map((col) => (
                              <div
                                key={col.id}
                                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    {col.nationalRanking ? (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono">
                                        #{col.nationalRanking}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Accredited</span>
                                    )}
                                    <span className="flex items-center text-[11px] font-bold text-amber-700">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                      {col.rating.toFixed(1)}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1">
                                    {col.name}
                                  </h4>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-slate-600">
                                  {formatCurrency(col.fees)}/yr
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Action Button */}
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-500 font-medium">
                            {item.colleges.length} institutions in benchmark
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleLaunchComparison(item)}
                            className="gap-1.5 shadow-xs"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>View Side-by-Side</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Inline Note & Deadline Editing Modal */}
        {editingItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    Edit Application Timeline & Notes
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-4">
                  Manage your application deadline and personal strategy notes for{' '}
                  <strong className="text-slate-800">{editingItem.college.name}</strong>.
                </p>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Application Deadline
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Jan 15, 2025 or Early Decision"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Personal Notes & Strategy
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Spoke with admissions dean; strong robotics program; application submitted via Common App..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    maxLength={1000}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                  />
                  <div className="text-right text-[10px] text-slate-400 mt-1">
                    {editNotes.length} / 1000 characters
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={isUpdatingRecord}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={isUpdatingRecord}
                  className="gap-1.5 shadow-xs"
                >
                  {isUpdatingRecord ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SavedLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-24 bg-white rounded-xl border border-slate-200 mb-8 animate-pulse" />
        <SkeletonGrid count={3} />
      </div>
    </div>
  );
}

export default function SavedCollegesPage() {
  return (
    <Suspense fallback={<SavedLoadingFallback />}>
      <SavedContent />
    </Suspense>
  );
}
