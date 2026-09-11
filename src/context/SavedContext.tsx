'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { useAuth } from './AuthContext';

const SAVED_STORAGE_KEY = 'cf_saved_college_ids_v2';
const LEGACY_STORAGE_KEY = 'cf_saved_college_ids';

interface SavedContextType {
  savedIds: Set<string>;
  savedCount: number;
  isLoading: boolean;
  isSaved: (collegeId: string) => boolean;
  toggleSave: (collegeId: string) => Promise<boolean>;
  removeSaved: (collegeId: string) => Promise<boolean>;
  clearSaved: () => void;
  isCollegeSaving: (collegeId: string) => boolean;
  refetchSaved: () => Promise<void>;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

function getSavedSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    const v2 = localStorage.getItem(SAVED_STORAGE_KEY);
    if (v2) return v2;

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      localStorage.setItem(SAVED_STORAGE_KEY, legacy);
      return legacy;
    }
    return '[]';
  } catch {
    return '[]';
  }
}

function getServerSavedSnapshot(): string {
  return '[]';
}

function subscribeSaved(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('cf_saved_updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('cf_saved_updated', callback);
  };
}

export function updateSavedStorage(ids: string[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(ids));
      window.dispatchEvent(new Event('cf_saved_updated'));
    } catch (e) {
      console.error('Failed to update saved storage:', e);
    }
  }
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const rawSavedState = useSyncExternalStore(subscribeSaved, getSavedSnapshot, getServerSavedSnapshot);

  const savedIdList: string[] = useMemo(() => {
    try {
      const parsed = JSON.parse(rawSavedState);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [rawSavedState]);

  const savedIds: Set<string> = useMemo(() => new Set(savedIdList), [savedIdList]);

  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const clearSaved = useCallback(() => {
    updateSavedStorage([]);
  }, []);

  const fetchSaved = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/saved', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          const ids = json.data.map((item: { collegeId: string }) => item.collegeId);
          updateSavedStorage(ids);
        }
      } else if (res.status === 401) {
        clearSaved();
      }
    } catch (error) {
      console.error('Failed to fetch saved colleges:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, clearSaved]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      clearSaved();
      return;
    }

    fetchSaved();
  }, [user, isAuthLoading, fetchSaved, clearSaved]);

  const isSaved = useCallback(
    (collegeId: string) => {
      return savedIds.has(collegeId);
    },
    [savedIds]
  );

  const isCollegeSaving = useCallback(
    (collegeId: string) => {
      return savingIds.has(collegeId);
    },
    [savingIds]
  );

  const toggleSave = useCallback(
    async (collegeId: string): Promise<boolean> => {
      if (!user) return false;

      const currentlySaved = savedIds.has(collegeId);
      const currentList = Array.from(savedIds);

      // Optimistic update
      const nextList = currentlySaved
        ? currentList.filter((id) => id !== collegeId)
        : [...currentList, collegeId];

      updateSavedStorage(nextList);
      setSavingIds((prev) => new Set(prev).add(collegeId));

      try {
        if (currentlySaved) {
          // DELETE request
          const res = await fetch(`/api/saved/${collegeId}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 404) {
            // Revert optimistic delete if failed
            updateSavedStorage(currentList);
            return false;
          }
          return true;
        } else {
          // POST request
          const res = await fetch('/api/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collegeId }),
          });

          if (res.ok || res.status === 409) {
            // Ensure ID is added in case 409 occurred
            if (!nextList.includes(collegeId)) {
              updateSavedStorage([...nextList, collegeId]);
            }
            return true;
          } else {
            const errData = await res.json().catch(() => null);
            console.error('Failed to save college:', res.status, errData);
            // Revert optimistic add if save failed
            updateSavedStorage(currentList);
            return false;
          }
        }
      } catch (error) {
        console.error('Error toggling saved college:', error);
        updateSavedStorage(currentList);
        return false;
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(collegeId);
          return next;
        });
      }
    },
    [user, savedIds]
  );

  const removeSaved = useCallback(
    async (collegeId: string): Promise<boolean> => {
      return toggleSave(collegeId);
    },
    [toggleSave]
  );

  return (
    <SavedContext.Provider
      value={{
        savedIds,
        savedCount: savedIds.size,
        isLoading,
        isSaved,
        toggleSave,
        removeSaved,
        clearSaved,
        isCollegeSaving,
        refetchSaved: fetchSaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
}
