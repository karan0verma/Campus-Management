'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Complaint, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  Calendar,
  MapPin,
  Cpu
} from 'lucide-react';

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Complaints</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track the progress, technician assignments, and repair remarks for your submitted tickets.
            </p>
          </div>
          <Link
            href="/student/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Raise New Complaint
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID or equipment..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </form>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === '' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading your complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Complaints Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {statusFilter
                ? `You have no complaints matching the filter "${statusFilter}".`
                : "You haven't submitted any complaints yet."}
            </p>
            <Link
              href="/student/complaints/new"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-4 h-4" />
              Submit your first complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      {c.ticket_id}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      {c.equipment_name}
                      <span className="font-mono text-xs font-normal text-slate-500">
                        ({c.equipment_id_str})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {c.building_name} &gt; {c.floor_name} &gt; {c.room_name} ({c.room_number})
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{c.description}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right text-xs">
                    <p className="text-slate-400 text-[11px]">Assigned Technician</p>
                    <p className="font-semibold text-slate-800">
                      {c.assigned_to_name ? c.assigned_to_name : 'Pending Assignment'}
                    </p>
                  </div>

                  <Link
                    href={`/student/complaints/${c.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors self-end md:self-auto"
                  >
                    View Details & Timeline <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
