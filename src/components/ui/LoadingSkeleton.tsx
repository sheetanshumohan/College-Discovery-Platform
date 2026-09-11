import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs animate-pulse flex flex-col justify-between overflow-hidden min-h-[224px]">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-24 bg-slate-200 rounded-full" />
            <div className="h-5 w-16 bg-slate-100 rounded-full" />
          </div>
          <div className="h-6 w-6 bg-slate-200 rounded-md" />
        </div>
        <div className="h-6 bg-slate-200 rounded w-4/5 mt-1.5" />
        <div className="flex items-center gap-3 mt-2">
          <div className="h-4 bg-slate-100 rounded w-28" />
          <div className="h-4 bg-slate-100 rounded w-12" />
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100 grid grid-cols-3 gap-2">
        <div className="h-9 bg-slate-200/60 rounded" />
        <div className="h-9 bg-slate-200/60 rounded" />
        <div className="h-9 bg-slate-200/60 rounded" />
      </div>

      <div className="p-4 pt-3 flex items-center justify-between gap-3 bg-white">
        <div className="h-7 w-20 bg-slate-200 rounded-md" />
        <div className="h-5 w-24 bg-slate-100 rounded" />
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
