'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { Complaint, DashboardStats, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AlertCircle,
  PlusCircle,
  Building2,
  Clock,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Layers
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, complaintsData] = await Promise.all([
          api.getDashboardStats(),
          api.getComplaints(),
        ]);
        setStats(statsData);
        setRecentComplaints(complaintsData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Department of {user?.department || 'Student Services'} • Student Portal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/student/layout"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              Explore Layout
            </Link>
            <Link
              href="/student/complaints/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Raise Complaint
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Complaints</span>
              <AlertCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.total ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Submitted by you</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Action</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-amber-600">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.pending ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Awaiting admin assignment</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
              <Wrench className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-extrabold text-indigo-600">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.in_progress ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Under repair by technician</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.resolved ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Fixed and verified</p>
          </div>
        </div>

        {/* Quick Access Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/student/layout"
            className="group p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Browse College Infrastructure</h3>
              <p className="text-xs text-blue-100 mt-1 max-w-sm">
                Explore buildings, floors, and rooms. View equipment inventory and raise direct maintenance requests.
              </p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/student/complaints/new"
            className="group p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mb-3">
                <PlusCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold">Report Equipment Breakdown</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">
                Having an issue with a PC, projector, AC, or lab equipment? Submit a complaint with immediate ticket generation.
              </p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform shrink-0 text-blue-400" />
          </Link>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Recent Complaints</h2>
              <p className="text-xs text-slate-500">Track current status and technician updates</p>
            </div>
            <Link
              href="/student/complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading complaints...</p>
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              You haven't submitted any complaints yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <Link
                  key={c.id}
                  href={`/student/complaints/${c.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{c.ticket_id}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {c.equipment_name} <span className="font-mono text-xs text-slate-500 font-normal">({c.equipment_id_str})</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.building_name} • {c.floor_name} • {c.room_name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-500">
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
