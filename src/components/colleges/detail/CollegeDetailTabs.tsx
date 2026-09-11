'use client';

import React, { useState, useEffect } from 'react';
import { Building2, GraduationCap, Briefcase, MessageSquare } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'courses', label: 'Programs', icon: GraduationCap },
  { id: 'placements', label: 'Placements & ROI', icon: Briefcase },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
];

export function CollegeDetailTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Sync tab on initial page load from URL hash
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && TABS.some((t) => t.id === hash)) {
        setActiveTab(hash);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    // Scrollspy to detect which section is currently in viewport
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = TABS.length - 1; i >= 0; i--) {
        const section = document.getElementById(TABS[i].id);
        if (section && section.offsetTop <= scrollPos) {
          setActiveTab(TABS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
    const target = document.getElementById(tabId);
    if (target) {
      const headerOffset = 130;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs mb-8 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar" aria-label="College profile sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
