'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CompareProvider } from '@/context/CompareContext';
import { SavedProvider } from '@/context/SavedContext';
import { CompareDock } from '@/components/compare/CompareDock';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SavedProvider>
        <CompareProvider>
          {children}
          <CompareDock />
        </CompareProvider>
      </SavedProvider>
    </AuthProvider>
  );
}
