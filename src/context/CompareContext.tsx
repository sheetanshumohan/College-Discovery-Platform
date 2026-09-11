'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'cf_compare_items_v2';
const LEGACY_STORAGE_KEY = 'cf_compare_ids';
export const MAX_COMPARE_LIMIT = 3;

export interface CompareItem {
  id: string;
  name: string;
}

interface CompareContextType {
  compareIds: string[];
  compareItems: CompareItem[];
  addToCompare: (id: string, name?: string) => boolean;
  removeFromCompare: (id: string) => void;
  toggleCompare: (id: string, name?: string) => boolean;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  isMaxReached: boolean;
  maxLimit: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

function getSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    const v2 = localStorage.getItem(STORAGE_KEY);
    if (v2) return v2;

    // Migrate from legacy string array if exists
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        const migrated: CompareItem[] = parsed.map((item) =>
          typeof item === 'string' ? { id: item, name: '' } : item
        );
        const serialized = JSON.stringify(migrated);
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return serialized;
      }
    }
    return '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot(): string {
  return '[]';
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('cf_compare_updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('cf_compare_updated', callback);
  };
}

function updateStorage(items: CompareItem[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_COMPARE_LIMIT)));
      window.dispatchEvent(new Event('cf_compare_updated'));
    } catch (e) {
      console.error('Failed to update compare storage:', e);
    }
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const rawState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const compareItems: CompareItem[] = useMemo(() => {
    try {
      const parsed = JSON.parse(rawState);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) =>
        typeof item === 'string' ? { id: item, name: '' } : item
      );
    } catch {
      return [];
    }
  }, [rawState]);

  const compareIds = useMemo(() => compareItems.map((item) => item.id), [compareItems]);

  const addToCompare = useCallback(
    (id: string, name = ''): boolean => {
      if (compareItems.some((item) => item.id === id)) return false;
      if (compareItems.length >= MAX_COMPARE_LIMIT) return false;
      updateStorage([...compareItems, { id, name: name || 'Selected College' }]);
      return true;
    },
    [compareItems]
  );

  const removeFromCompare = useCallback(
    (id: string) => {
      updateStorage(compareItems.filter((item) => item.id !== id));
    },
    [compareItems]
  );

  const toggleCompare = useCallback(
    (id: string, name = ''): boolean => {
      if (compareItems.some((item) => item.id === id)) {
        updateStorage(compareItems.filter((item) => item.id !== id));
        return false;
      }
      if (compareItems.length >= MAX_COMPARE_LIMIT) {
        return false;
      }
      updateStorage([...compareItems, { id, name: name || 'Selected College' }]);
      return true;
    },
    [compareItems]
  );

  const isInCompare = useCallback(
    (id: string) => compareItems.some((item) => item.id === id),
    [compareItems]
  );

  const clearCompare = useCallback(() => {
    updateStorage([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        compareItems,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
        isMaxReached: compareItems.length >= MAX_COMPARE_LIMIT,
        maxLimit: MAX_COMPARE_LIMIT,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
