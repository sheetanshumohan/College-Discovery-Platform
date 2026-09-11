import React from 'react';

export default function CollegeDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b border-slate-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-64 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="space-y-4 max-w-3xl">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-28 bg-slate-200 rounded-full"></div>
            </div>
            <div className="h-10 sm:h-12 w-3/4 bg-slate-200 rounded"></div>
            <div className="h-5 w-48 bg-slate-200 rounded"></div>
            <div className="pt-2 flex gap-3">
              <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
              <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
            </div>
          </div>

          {/* Quick Metrics Bar Skeleton */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-16 bg-slate-100 rounded-xl"></div>
            <div className="h-16 bg-slate-100 rounded-xl"></div>
            <div className="h-16 bg-slate-100 rounded-xl"></div>
            <div className="h-16 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-64"></div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-80"></div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-64"></div>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-72"></div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-48"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
