'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  Wrench,
  Lock,
  User as UserIcon,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function LoginPage() {
  const { user, role, login, demoLogin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'technician') router.push('/technician/dashboard');
      else router.push('/student/dashboard');
    }
  }, [user, role, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoRole: 'student' | 'admin' | 'technician') => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(demoRole);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">CampusOps</h1>
        <p className="mt-1 text-sm text-slate-300">
          College Infrastructure and Maintenance Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, student_arun, tech_raj"
                  className="w-full text-sm pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?
            </p>
            <Link
              href="/signup"
              className="mt-1.5 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 text-xs font-bold transition-colors"
            >
              <span>Create Account (Student / Technician / Admin)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              One-Click Role Demo Logins
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                disabled={loading}
                className="w-full flex items-center justify-between px-3.5 py-2.5 border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 rounded-xl text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-200 text-purple-700 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Administrator</p>
                    <p className="text-[11px] text-purple-700">Full layout, equipment & ticket control</p>
                  </div>
                </div>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-mono text-slate-600 border border-purple-200">
                  admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('student')}
                disabled={loading}
                className="w-full flex items-center justify-between px-3.5 py-2.5 border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 rounded-xl text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-200 text-blue-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Student</p>
                    <p className="text-[11px] text-blue-700">Navigate rooms & submit complaints</p>
                  </div>
                </div>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-mono text-slate-600 border border-blue-200">
                  student_arun
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('technician')}
                disabled={loading}
                className="w-full flex items-center justify-between px-3.5 py-2.5 border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 rounded-xl text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-700 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Technician</p>
                    <p className="text-[11px] text-amber-700">View tasks, update progress & resolve</p>
                  </div>
                </div>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-mono text-slate-600 border border-amber-200">
                  tech_raj
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          CampusOps • College Infrastructure & Maintenance System
        </p>
      </div>
    </div>
  );
}
