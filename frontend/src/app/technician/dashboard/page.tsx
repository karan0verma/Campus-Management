'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { Complaint, DashboardStats, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { UpdateStatusModal } from '@/components/UpdateStatusModal';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  MapPin,
  Cpu,
  UserCheck
} from 'lucide-react';

export default function TechnicianDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [assignedComplaints, setAssignedComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<'In Progress' | 'Resolved'>('In Progress');

  const loadData = async () => {
    try {
      const [statsData, complaintsData] = await Promise.all([
        api.getDashboardStats(),
        api.getComplaints(),
      ]);
      setStats(statsData);
      setAssignedComplaints(complaintsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (complaint: Complaint, status: 'In Progress' | 'Resolved') => {
    setSelectedComplaint(complaint);
    setModalDefaultStatus(status);
    setModalOpen(true);
  };

  const handleUpdateSuccess = (updated: Complaint) => {
    setAssignedComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    loadData();
  };

  return (
    <ProtectedRoute allowedRoles={['technician']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Technician Workspace: {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {user?.department || 'Infrastructure & Hardware Maintenance Team'} • CampusOps Maintenance Console
            </p>
          </div>
          <Link
            href="/technician/complaints"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Wrench className="w-4 h-4" />
            View All Assigned Tickets
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Assigned</span>
              <UserCheck className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.total ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Tickets assigned to you</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Action</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-amber-600">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.assigned ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Needs diagnosis & start</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
              <Wrench className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-extrabold text-indigo-600">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.in_progress ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Repairs currently underway</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.resolved ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Successfully completed</p>
          </div>
        </div>

        {/* Assigned Complaints Requiring Attention */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned Complaints Requiring Action</h2>
              <p className="text-xs text-slate-500">Tickets assigned to you that are ready for repair or pending resolution</p>
            </div>
            <Link
              href="/technician/complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All Complaints <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading assignments...</p>
            </div>
          ) : assignedComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No complaints currently assigned to you.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {assignedComplaints.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.ticket_id}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                      <span className="text-xs text-slate-400">
                        Reported by {c.student_name} on {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      {c.equipment_name}
                      <span className="font-mono text-xs font-normal text-slate-500">
                        ({c.equipment_id_str})
                      </span>
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{c.building_name}</span> &gt; {c.floor_name} &gt; {c.room_name} ({c.room_number})
                    </p>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{c.description}"
                    </p>
                  </div>

                  {/* Technician Actions */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    <Link
                      href={`/technician/complaints/${c.id}`}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Details
                    </Link>

                    {c.status !== 'Resolved' && (
                      <>
                        {c.status === 'Assigned' && (
                          <button
                            onClick={() => handleOpenModal(c, 'In Progress')}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            Start Work
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(c, 'Resolved')}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Status Modal */}
        <UpdateStatusModal
          complaint={selectedComplaint}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleUpdateSuccess}
          defaultStatus={modalDefaultStatus}
        />
      </div>
    </ProtectedRoute>
  );
}
