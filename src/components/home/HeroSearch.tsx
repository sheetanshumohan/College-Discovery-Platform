'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeroSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (locationTerm.trim()) params.set('location', locationTerm.trim());
    router.push(`/colleges?${params.toString()}`);
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
    <div className="w-full max-w-3xl mx-auto">
      {/* Primary Search Form Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-lg border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500"
      >
        {/* Keyword Search Input */}
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200/60 focus-within:bg-white focus-within:border-indigo-400 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by university name, major, or keyword..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Location Input */}
        <div className="sm:w-56 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200/60 focus-within:bg-white focus-within:border-indigo-400 transition-colors">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
            placeholder="City or state (e.g. CA)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Search Submit Button */}
        <Button
          type="submit"
          size="md"
          variant="primary"
          className="rounded-xl px-5 gap-2 shrink-0 justify-center h-10 sm:h-auto"
        >
          <span>Find Colleges</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

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
