import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Star,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { getCollegeBySlug } from '@/lib/colleges';
import { Badge } from '@/components/ui/Badge';
import { CollegeDetailActions } from '@/components/colleges/detail/CollegeDetailActions';

export const dynamic = 'force-dynamic';

interface CollegePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollegePageProps): Promise<Metadata> {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);

  if (!college) {
    return {
      title: 'College Not Found — CollegeFinder',
      description: 'The requested college could not be located in our directory.',
    };
  }

  const formattedFees = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(college.fees);

  return {
    title: `${college.name} — Rankings, Fees, Courses & Reviews | CollegeFinder`,
    description: `Explore admissions, annual tuition (${formattedFees}), national ranking (#${college.nationalRanking ?? 'N/A'}), placement outcomes, and student reviews for ${college.name} in ${college.location}.`,
    openGraph: {
      title: `${college.name} | CollegeFinder`,
      description: college.description.slice(0, 160),
    },
  };
}

export default async function CollegeDetailPage({ params }: CollegePageProps) {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);

  if (!college) {
    notFound();
  }

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPercent = (val?: number | null) => {
    if (val === undefined || val === null) return 'N/A';
    const percent = val <= 1 ? val * 100 : val;
    return `${percent.toFixed(1)}%`;
  };

  const formattedDate = (dateStr: string | Date) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return 'Recent';
    }
  };

  const collegeTypeDisplay =
    college.type === 'PUBLIC'
      ? 'Public Institution'
      : college.type === 'PRIVATE_NON_PROFIT'
      ? 'Private Non-Profit'
      : 'Private For-Profit';

  const campusSettingDisplay =
    college.campusSetting === 'URBAN'
      ? 'Urban Campus'
      : college.campusSetting === 'SUBURBAN'
      ? 'Suburban Campus'
      : 'Rural Campus';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Breadcrumb Navigation Bar */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
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
            <li className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md" aria-current="page">
              {college.name}
            </li>
          </ol>

          <Link
            href="/colleges"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Search</span>
          </Link>
        </div>
      </nav>

      {/* Hero Summary Area */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              {/* Badges Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                {college.nationalRanking && (
                  <Badge variant="warning">
                    #{college.nationalRanking} in National Universities
                  </Badge>
                )}
                <Badge variant={college.type === 'PUBLIC' ? 'info' : 'outline'}>
                  {collegeTypeDisplay}
                </Badge>
                <Badge variant="default">{campusSettingDisplay}</Badge>
              </div>

              {/* Title & Location */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {college.name}
              </h1>

              <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {college.location}
                </span>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <span className="font-bold text-slate-900 font-mono">
                    {college.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-400">
                    ({college.reviews.length} {college.reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                {college.websiteUrl && (
                  <a
                    href={college.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Actions (Compare + Save) */}
            <div className="lg:pt-2">
              <CollegeDetailActions
                collegeId={college.id}
                collegeSlug={college.slug}
                collegeName={college.name}
              />
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Annual Tuition
              </span>
              <span className="block text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">
                {formatCurrency(college.fees)}
              </span>
              <span className="text-[11px] text-slate-500">Estimated base</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Acceptance Rate
              </span>
              <span className="block text-lg sm:text-xl font-bold font-mono text-indigo-600 mt-0.5">
                {formatPercent(college.acceptanceRate)}
              </span>
              <span className="text-[11px] text-slate-500">Admissions selectivity</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Graduation Rate
              </span>
              <span className="block text-lg sm:text-xl font-bold font-mono text-emerald-700 mt-0.5">
                {formatPercent(college.graduationRate)}
              </span>
              <span className="text-[11px] text-slate-500">6-year completion</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Student Body
              </span>
              <span className="block text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">
                {college.studentBodySize ? college.studentBodySize.toLocaleString() : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500">Enrolled undergraduates</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Faculty Ratio
              </span>
              <span className="block text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">
                {college.studentFacultyRatio ? `${college.studentFacultyRatio}:1` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500">Student to professor</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Financial Aid
              </span>
              <span className="block text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">
                {college.avgFinancialAid ? formatCurrency(college.avgFinancialAid) : 'Available'}
              </span>
              <span className="text-[11px] text-slate-500">Average package/yr</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Detail Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2/3): Overview, Courses, Placements, Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview Section */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">About {college.name}</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
                {college.description}
              </p>

              {/* In-State vs Out-of-State Comparison if available */}
              {(college.inStateTuition || college.outOfStateTuition) && (
                <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {college.inStateTuition && (
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        In-State Tuition & Fees
                      </span>
                      <span className="block text-base font-bold font-mono text-slate-900 mt-0.5">
                        {formatCurrency(college.inStateTuition)} / yr
                      </span>
                    </div>
                  )}
                  {college.outOfStateTuition && (
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Out-of-State Tuition & Fees
                      </span>
                      <span className="block text-base font-bold font-mono text-slate-900 mt-0.5">
                        {formatCurrency(college.outOfStateTuition)} / yr
                      </span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Courses & Academic Offerings */}
            <section id="courses" className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">Academic Programs</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  {college.courses.length} {college.courses.length === 1 ? 'Program' : 'Programs'} Listed
                </span>
              </div>

              {college.courses.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {college.courses.map((course) => (
                    <div
                      key={course.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium text-indigo-600">
                            <Award className="w-3.5 h-3.5" />
                            {course.degree}
                          </span>
                          <span>•</span>
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Program Fees
                        </span>
                        <span className="block text-sm font-bold font-mono text-slate-900 mt-0.5">
                          {formatCurrency(course.fees)} / yr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    No course listings currently published
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Specific degree course schedules for this institution are being updated from catalog records.
                  </p>
                </div>
              )}
            </section>

            {/* Career Outcomes & Placement History */}
            <section id="placements" className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">Career Outcomes & Placements</h2>
              </div>

              {college.placements.length > 0 ? (
                <div className="space-y-4">
                  {college.placements.map((placement) => (
                    <div
                      key={placement.id}
                      className="p-5 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          Class of {placement.year}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {formatPercent(placement.placementRate)} Placement Rate
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Average Package
                          </span>
                          <span className="block text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
                            {formatCurrency(placement.averagePackage)}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Highest Package
                          </span>
                          <span className="block text-base sm:text-lg font-bold font-mono text-indigo-600 mt-0.5">
                            {formatCurrency(placement.highestPackage)}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Employment Rate
                          </span>
                          <span className="block text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
                            {formatPercent(placement.placementRate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    No placement reports available
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Career outcomes and salary statistics have not yet been published for this institution.
                  </p>
                </div>
              )}
            </section>

            {/* Student Reviews Section */}
            <section id="reviews" className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">Student Reviews</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-amber-900 font-mono">
                    {college.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              {college.reviews.length > 0 ? (
                <div className="space-y-4">
                  {college.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                            {(rev.user?.name || 'S')[0].toUpperCase()}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {rev.user?.name || 'Verified Student'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {formattedDate(rev.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No student reviews yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Be the first verified student to share feedback on academics, campus culture, and faculty.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Side Column (1/3): Key Institutional Facts & Sticky Info */}
          <aside className="space-y-6">
            {/* Key Facts Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Key Institutional Facts
              </h3>

              <dl className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Institution Type</dt>
                  <dd className="font-semibold text-slate-900">{collegeTypeDisplay}</dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Setting</dt>
                  <dd className="font-semibold text-slate-900">{campusSettingDisplay}</dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">National Rank</dt>
                  <dd className="font-semibold text-slate-900 font-mono">
                    {college.nationalRanking ? `#${college.nationalRanking}` : 'Unranked'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Acceptance Rate</dt>
                  <dd className="font-semibold text-slate-900 font-mono">
                    {formatPercent(college.acceptanceRate)}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Graduation Rate</dt>
                  <dd className="font-semibold text-slate-900 font-mono">
                    {formatPercent(college.graduationRate)}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Student Body</dt>
                  <dd className="font-semibold text-slate-900 font-mono">
                    {college.studentBodySize ? college.studentBodySize.toLocaleString() : 'N/A'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Faculty Ratio</dt>
                  <dd className="font-semibold text-slate-900 font-mono">
                    {college.studentFacultyRatio ? `${college.studentFacultyRatio}:1` : 'N/A'}
                  </dd>
                </div>

                {college.applicationDeadline && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <dt className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      App Deadline
                    </dt>
                    <dd className="font-semibold text-slate-900">
                      {college.applicationDeadline}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Admissions Profile (Test Scores & GPA) */}
            {(college.avgSatScore || college.avgActScore || college.avgGpa) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                  Admissions Profile
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {college.avgSatScore && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        Avg SAT
                      </span>
                      <span className="block text-base font-bold font-mono text-slate-900 mt-0.5">
                        {college.avgSatScore}
                      </span>
                    </div>
                  )}
                  {college.avgActScore && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        Avg ACT
                      </span>
                      <span className="block text-base font-bold font-mono text-slate-900 mt-0.5">
                        {college.avgActScore}
                      </span>
                    </div>
                  )}
                  {college.avgGpa && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        Avg GPA
                      </span>
                      <span className="block text-base font-bold font-mono text-slate-900 mt-0.5">
                        {college.avgGpa.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compare CTA Sidebar Widget */}
            <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-xs relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Decision Engine
                </span>
                <h4 className="text-lg font-bold mt-1 mb-2">Compare {college.name}</h4>
                <p className="text-xs text-indigo-200 leading-relaxed mb-4">
                  Evaluate side-by-side against up to 2 other colleges to analyze fees, career outcomes, and rankings.
                </p>
                <Link
                  href="/compare"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-white text-indigo-950 font-semibold text-xs hover:bg-indigo-50 transition-colors shadow-xs"
                >
                  Open Comparison Tray
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
