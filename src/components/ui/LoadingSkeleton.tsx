import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 mb-4">
        <div className="h-10 bg-slate-100 rounded"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-8 w-24 bg-slate-200 rounded"></div>
        <div className="h-8 w-20 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
