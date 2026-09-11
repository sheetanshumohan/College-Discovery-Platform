import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { CollegeSummary } from '@/types';
import { HeroSearch } from '@/components/home/HeroSearch';
import { CollegeCard } from '@/components/colleges/CollegeCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import {
  Compass,
  Columns3,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch top featured colleges directly from PostgreSQL database
  const featuredCollegesRaw = await prisma.college.findMany({
    orderBy: [
      { nationalRanking: 'asc' },
      { rating: 'desc' },
    ],
    take: 6,
    select: {
      id: true,
      name: true,
      slug: true,
      location: true,
      city: true,
      state: true,
      description: true,
      fees: true,
      rating: true,
      type: true,
      campusSetting: true,
      nationalRanking: true,
      acceptanceRate: true,
      graduationRate: true,
      studentBodySize: true,
      studentFacultyRatio: true,
      inStateTuition: true,
      outOfStateTuition: true,
      avgFinancialAid: true,
      roomAndBoard: true,
      avgSatScore: true,
      avgActScore: true,
      avgGpa: true,
      applicationDeadline: true,
      websiteUrl: true,
      logoUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Safe serialization for Client Component boundary
  const featuredColleges: CollegeSummary[] = featuredCollegesRaw.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  // Top educational hubs
  const popularHubs = [
    { state: 'CA', name: 'California', description: 'Silicon Valley & Bay Area Flagships', count: '14+ Colleges' },
    { state: 'MA', name: 'Massachusetts', description: 'Boston & Cambridge Academic Corridor', count: '12+ Colleges' },
    { state: 'NY', name: 'New York', description: 'Metropolitan & Upstate Research Centers', count: '12+ Colleges' },
    { state: 'TX', name: 'Texas', description: 'Austin Silicon Hills & Houston Tech Hub', count: '10+ Colleges' },
    { state: 'WA', name: 'Washington', description: 'Seattle Tech Corridor & Pacific NW', count: '8+ Colleges' },
    { state: 'IL', name: 'Illinois', description: 'Chicago Financial & Engineering Centers', count: '8+ Colleges' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100/80 via-slate-50 to-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Official Institutional & Placement Data</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Find the right college for you.
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover, inspect, compare, and shortlist institutions with transparent tuition costs, verified admissions criteria, and career placement outcomes.
          </p>

          {/* Primary Search Component */}
          <div className="mt-8 sm:mt-10">
            <HeroSearch />
          </div>
        </div>

        {/* Subtle Background Accent Pattern */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"
          aria-hidden="true"
        />
      </section>

      {/* 2. STATS AT A GLANCE */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">108+</span>
              <span className="block text-xs sm:text-sm text-slate-600 font-medium mt-1">Accredited Colleges</span>
            </div>
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-indigo-600">400+</span>
              <span className="block text-xs sm:text-sm text-slate-600 font-medium mt-1">Degree Programs</span>
            </div>
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600">3-Way</span>
              <span className="block text-xs sm:text-sm text-slate-600 font-medium mt-1">Side-by-Side Compare</span>
            </div>
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">100%</span>
              <span className="block text-xs sm:text-sm text-slate-600 font-medium mt-1">Free for Students</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED COLLEGES */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Top Rated"
            title="Featured Universities"
            description="Explore premier institutions renowned for academic excellence, pioneering research, and industry placements."
            action={
              <Link href="/colleges">
                <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
                  <span>Explore All 108 Colleges</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR LOCATIONS */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Geographic Discovery"
            title="Explore by Popular Region"
            description="Find institutions in key academic clusters, tech corridors, and major metropolitan centers."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {popularHubs.map((hub) => (
              <Link
                key={hub.state}
                href={`/colleges?location=${hub.state}`}
                className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {hub.state}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {hub.count}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {hub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {hub.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Browse {hub.name} colleges</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW COMPARISON WORKS */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Decision Engine"
            title="How Side-by-Side Comparison Works"
            description="Comparing colleges directly against hard constraints removes guesswork and reveals true value."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-100">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Stage Candidate Colleges</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click &ldquo;+ Compare&rdquo; on any card or detail page to add up to 3 candidate institutions to your floating tray.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-100">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Inspect Side-by-Side</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                View detailed matrix comparisons across annual tuition, acceptance rates, test scores, and 2024 placement outcomes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-100">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Identify Differences</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spot best values automatically and share comparison links directly with parents or college counselors.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/compare">
              <Button variant="secondary" size="md" className="gap-2">
                <Columns3 className="w-4 h-4 text-indigo-400" />
                <span>Open Comparison Matrix</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SAVE & ORGANIZE EXPLANATION */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-indigo-400 mb-3">
                <Bookmark className="w-4 h-4" />
                Student Shortlist
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Save your favorites and keep personal application notes.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Create a free student account to bookmark target, reach, and safety schools. Add private notes on application deadlines and financial aid requirements.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <Button variant="inverted" size="md">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/saved">
                  <Button variant="outline-white" size="md">
                    View Shortlist
                  </Button>
                </Link>
              </div>
            </div>

            {/* Graphic icon accent */}
            <div className="absolute right-6 -bottom-10 opacity-10 hidden lg:block pointer-events-none">
              <Building2 className="w-96 h-96 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION TO EXPLORE */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to explore 108+ colleges?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Filter by tuition fees, campus setting, selectivity, and state to find your ideal college match.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/colleges">
              <Button size="lg" variant="primary" className="gap-2 px-6">
                <Compass className="w-5 h-5" />
                <span>Explore College Catalog</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
