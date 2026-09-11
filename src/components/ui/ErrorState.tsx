import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while communicating with the server. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50/50 rounded-xl border border-red-200">
      <div className="p-3 bg-red-100 text-red-600 rounded-full mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      )}
    </div>
  );
}
