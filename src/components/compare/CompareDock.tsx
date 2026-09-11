'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Columns3, X, ArrowRight } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { Button } from '@/components/ui/Button';

export function CompareDock() {
  const router = useRouter();
  const pathname = usePathname();
  const { compareItems, compareIds, removeFromCompare, clearCompare, maxLimit } = useCompare();
  const [dismissedCount, setDismissedCount] = useState<number | null>(null);

  const itemsCount = compareItems.length;
  const isDismissed = dismissedCount === itemsCount && itemsCount > 0;

  // Hide completely when on the compare page, when empty, or when dismissed
  if (itemsCount === 0 || pathname.startsWith('/compare') || isDismissed) {
    return null;
  }

  const compareUrl = `/compare?ids=${compareIds.join(',')}`;

  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    clearCompare();
    setDismissedCount(null);
    if (pathname.startsWith('/compare')) {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/compare');
      }
      router.replace('/compare');
    }
  };

  const handleRemove = (id: string) => {
    removeFromCompare(id);
    if (pathname.startsWith('/compare')) {
      const remaining = compareIds.filter((cid) => cid !== id);
      if (remaining.length >= 2) {
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/compare?ids=${remaining.join(',')}`);
        }
        router.replace(`/compare?ids=${remaining.join(',')}`);
      } else {
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/compare');
        }
        router.replace('/compare');
      }
    }
  };

  return (
    <aside
      aria-label="Comparison Tray"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700/80 p-3 sm:p-4 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-indigo-600 rounded-md text-white">
            <Columns3 className="w-4 h-4" />
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-white">Compare Tray</h3>
          <span className="text-[11px] font-mono bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full border border-slate-700">
            {compareItems.length}/{maxLimit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={() => setDismissedCount(itemsCount)}
            aria-label="Close comparison tray"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Dismiss tray"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Items List */}
      <div className="flex flex-col gap-1.5 mb-3">
        {compareItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-xs bg-slate-800/80 rounded-md px-2.5 py-1.5 border border-slate-700/60"
          >
            <span className="truncate pr-2 text-slate-200 font-medium">
              {item.name || 'Selected College'}
            </span>
            <button
              onClick={() => handleRemove(item.id)}
              aria-label={`Remove ${item.name || 'college'} from comparison`}
              className="text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2">
        {compareItems.length < 2 ? (
          <p className="text-[11px] text-slate-400 flex-1">
            Select at least 1 more college to compare.
          </p>
        ) : (
          <Link
            href={compareUrl}
            onClick={() => setDismissedCount(itemsCount)}
            className="w-full"
          >
            <Button size="sm" variant="primary" className="w-full justify-between shadow-xs cursor-pointer">
              <span>Compare Selected ({compareItems.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}
