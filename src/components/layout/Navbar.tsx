'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Columns3, Bookmark, LogIn, LogOut, Menu, X, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import { useSaved } from '@/context/SavedContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { compareIds } = useCompare();
  const { savedCount } = useSaved();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const userDisplayName = user?.name || user?.email || 'Account';

  const navLinks = [
    { href: '/colleges', label: 'Explore', icon: Compass },
    {
      href: compareIds.length >= 2 ? `/compare?ids=${compareIds.join(',')}` : '/compare',
      label: 'Compare',
      icon: Columns3,
      badge: compareIds.length > 0 ? compareIds.length : undefined,
    },
    {
      href: '/saved',
      label: 'Saved',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : undefined,
    },
  ];

  const isActive = (href: string) => {
    if (href.startsWith('/colleges') && pathname.startsWith('/colleges')) return true;
    if (href.startsWith('/compare') && pathname.startsWith('/compare')) return true;
    if (href.startsWith('/saved') && pathname.startsWith('/saved')) return true;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                CollegeFinder
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 mt-0.5">
                Discovery & Decision
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'text-indigo-600 bg-indigo-50 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold font-mono rounded-full bg-indigo-600 text-white leading-none">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {!mounted ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Create Account
                  </Button>
                </Link>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                    {userInitial}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{userDisplayName}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-1.5 text-xs text-slate-600 hover:text-red-600"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium ${
                    active
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold font-mono rounded-full bg-indigo-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200">
            {mounted && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                    {userInitial}
                  </div>
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-slate-900">{userDisplayName}</span>
                    <span className="text-slate-500">{user.email}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center gap-2 text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
