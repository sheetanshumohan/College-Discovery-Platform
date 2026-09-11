import React from 'react';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  align = 'left',
  action,
  className = '',
}: SectionHeaderProps) {
  const isCentered = align === 'center';

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 ${className}`}
    >
      <div className={isCentered ? 'text-center w-full' : 'max-w-2xl'}>
        {badge && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
            {badge}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-2 text-sm sm:text-base text-slate-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
