'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CollegeDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('College detail error caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50/50">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-red-200 shadow-sm">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Unable to Load College Details
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          An unexpected error occurred while communicating with the database. Please try again or return to the directory.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => reset()} className="w-full sm:w-auto gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Link href="/colleges" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Colleges
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
