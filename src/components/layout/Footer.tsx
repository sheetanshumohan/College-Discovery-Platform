import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">CollegeFinder</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              A modern college discovery and decision-making platform helping students inspect admissions, financials, outcomes, and side-by-side comparisons.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/colleges" className="hover:text-white transition-colors">
                  Explore Catalog
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Side-by-Side Compare
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-white transition-colors">
                  Saved Shortlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Top States</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/colleges?location=CA" className="hover:text-white transition-colors">
                  California Universities
                </Link>
              </li>
              <li>
                <Link href="/colleges?location=MA" className="hover:text-white transition-colors">
                  Massachusetts Colleges
                </Link>
              </li>
              <li>
                <Link href="/colleges?location=NY" className="hover:text-white transition-colors">
                  New York Institutions
                </Link>
              </li>
              <li>
                <Link href="/colleges?location=TX" className="hover:text-white transition-colors">
                  Texas Universities
                </Link>
              </li>
            </ul>
          </div>

          {/* Engineering / Assessment Badge */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1">Architecture</h4>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>PostgreSQL + Prisma ORM</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Data pipeline indexed across tuition, selectivity, rankings, and placement outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CollegeFinder Platform. Built for Software Engineering Assessment.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Institutional Data
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
