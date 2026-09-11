import React from 'react';
import Link from 'next/link';
import { School, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CollegeNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50/50">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <School className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Institution Not Found
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          We couldn&apos;t find an institution matching this address. The college may have been renamed or the URL might be invalid.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/colleges" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full gap-2">
              <Search className="w-4 h-4" /> Browse All Colleges
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
