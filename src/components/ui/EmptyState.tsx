import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No institutions found',
  description = 'Try adjusting your search criteria or resetting your filters to discover more colleges.',
  actionLabel = 'Reset All Filters',
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-slate-300">
      <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-4 border border-slate-200">
        {icon || <SearchX className="w-8 h-8 text-slate-400" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
