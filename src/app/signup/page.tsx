'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/colleges';
  const { login, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to create account.');
      }

      if (json.data) {
        login(json.data);
        router.push(redirect);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and compare your favorite university prospects
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <input
                id="name-input"
                type="text"
                autoComplete="name"
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 transition-colors"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="email-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="email-input"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="password-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full justify-center gap-2 mt-2 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link
            href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-full max-w-md h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
