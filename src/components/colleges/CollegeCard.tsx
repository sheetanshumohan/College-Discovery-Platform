'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Bookmark, Check, Plus } from 'lucide-react';
import { CollegeSummary } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { useSaved } from '@/context/SavedContext';

interface CollegeCardProps {
  college: CollegeSummary;
  initialIsSaved?: boolean;
}

export function CollegeCard({ college, initialIsSaved = false }: CollegeCardProps) {
  const router = useRouter();
  const { isInCompare, toggleCompare, isMaxReached } = useCompare();
  const { user } = useAuth();
  const { isSaved: checkIsSaved, toggleSave, isCollegeSaving } = useSaved();

  const isSaved = checkIsSaved(college.id);
  const isSaving = isCollegeSaving(college.id);

  const inCompare = isInCompare(college.id);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?redirect=/colleges/${college.slug}`);
      return;
    }

    await toggleSave(college.id);
  };

  const formattedFees = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(college.fees);

  const acceptancePct = college.acceptanceRate
    ? `${(college.acceptanceRate * 100).toFixed(0)}%`
    : 'N/A';

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Banner / Badges Bar */}
      <div className="p-5 pb-3">
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

          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveToggle}
              disabled={isSaving}
              aria-label={isSaved ? 'Remove from saved' : 'Save college'}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isSaved
                  ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Institution Title */}
        <Link href={`/colleges/${college.slug}`} className="block group-hover:text-indigo-600 transition-colors">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
            {college.name}
          </h3>
        </Link>

        {/* Location & Rating */}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {college.location}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {college.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Structured Metrics Grid */}
      <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100 grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Annual Fees
          </span>
          <span className="block text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
            {formattedFees}
          </span>
        </div>

        <div>
          <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Acceptance
          </span>
          <span className="block text-sm font-bold font-mono tabular-nums text-indigo-600 mt-0.5">
            {acceptancePct}
          </span>
        </div>

        <div>
          <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Graduation
          </span>
          <span className="block text-sm font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
            {college.graduationRate ? `${(college.graduationRate * 100).toFixed(0)}%` : '—'}
          </span>
        </div>
      </div>

      {/* Footer Action Row */}
      <div className="p-4 pt-3 flex items-center justify-between gap-3 bg-white">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleCompare(college.id, college.name);
          }}
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
              <Check className="w-3.5 h-3.5" /> Added
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
          View Details
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
