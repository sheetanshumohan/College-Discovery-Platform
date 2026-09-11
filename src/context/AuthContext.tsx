'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'cf_auth_user_cache';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const u = json.data.user;
        setUser(u);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
        } catch {}
      } else {
        setUser(null);
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {}
      }
    } catch {
      setUser(null);
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    try {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY);
      if (cached && !ignore) {
        setUser(JSON.parse(cached));
      }
    } catch {}

    async function initUser() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!ignore) {
          if (res.ok) {
            const json = await res.json();
            const u = json.data.user;
            setUser(u);
            try {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
            } catch {}
          } else {
            setUser(null);
            try {
              localStorage.removeItem(AUTH_STORAGE_KEY);
            } catch {}
          }
        }
      } catch {
        if (!ignore) {
          setUser(null);
          try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          } catch {}
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    initUser();
    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem('cf_saved_college_ids');
        localStorage.removeItem('cf_saved_college_ids_v2');
      } catch {}
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
