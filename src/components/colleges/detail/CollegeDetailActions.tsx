'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Check, Scale } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { useSaved } from '@/context/SavedContext';

interface CollegeDetailActionsProps {
  collegeId: string;
  collegeSlug: string;
  collegeName: string;
}

export function CollegeDetailActions({
  collegeId,
  collegeSlug,
  collegeName,
}: CollegeDetailActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isInCompare, toggleCompare, isMaxReached } = useCompare();
  const { isSaved: checkIsSaved, toggleSave, isCollegeSaving } = useSaved();

  const isSaved = checkIsSaved(collegeId);
  const isSaving = isCollegeSaving(collegeId);

  const inCompare = isInCompare(collegeId);

  const handleSaveToggle = async () => {
    if (!user) {
      router.push(`/login?redirect=/colleges/${collegeSlug}`);
      return;
    }

    await toggleSave(collegeId);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Compare Action Button */}
      <button
        type="button"
        onClick={() => toggleCompare(collegeId, collegeName)}
        disabled={!inCompare && isMaxReached}
        aria-label={inCompare ? `Remove ${collegeName} from comparison` : `Add ${collegeName} to comparison`}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-xs ${
          inCompare
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : isMaxReached
            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
        }`}
      >
        {inCompare ? (
          <>
            <Check className="w-4 h-4 text-white" />
            <span>In Comparison</span>
          </>
        ) : (
          <>
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>{isMaxReached ? 'Compare Limit (3/3)' : 'Add to Compare'}</span>
          </>
        )}
      </button>

      {/* Save Action Button */}
      <button
        type="button"
        onClick={handleSaveToggle}
        disabled={isSaving}
        aria-label={isSaved ? `Remove ${collegeName} from saved list` : `Save ${collegeName}`}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-xs ${
          isSaved
            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
        }`}
      >
        <Bookmark
          className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`}
        />
        <span>{isSaving ? 'Updating...' : isSaved ? 'Saved to Favorites' : 'Save Institution'}</span>
      </button>
    </div>
  );
}
