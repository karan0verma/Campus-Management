'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { Complaint, DashboardStats, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { AssignTechnicianModal } from '@/components/AssignTechnicianModal';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  Wrench,
  CheckCircle2,
  Building2,
  Layers,
  DoorOpen,
  Cpu,
  Users,
  ArrowRight,
  UserCheck,
  Plus,
  Loader2,
  ExternalLink,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (keyName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Assign Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, complaintsData] = await Promise.all([
        api.getDashboardStats(),
        api.getComplaints(),
      ]);
      setStats(statsData);
      setComplaints(complaintsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssign = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = (updated: Complaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    loadData();
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Operations Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                Administrator
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Campus Infrastructure, Room Inventories, Equipment Health & Complaints Operations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/equipment"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              Manage Equipment
            </Link>
            <Link
              href="/admin/complaints"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              All Complaints
            </Link>
          </div>
        </div>

        {/* Staff Registration Security Passkeys Banner */}
        <div className="bg-slate-900 border border-slate-800 text-white p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Staff Registration Passkeys</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Share these keys with your college team so they can self-register as Technicians or Admins securely.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-amber-400 font-semibold">Tech Key:</span>
              <code className="font-mono font-bold text-white">TECH@CAMPUS2026</code>
              <button
                type="button"
                onClick={() => copyToClipboard('tech', 'TECH@CAMPUS2026')}
                className="p-1 text-slate-400 hover:text-white"
                title="Copy Technician Key"
              >
                {copiedKey === 'tech' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-purple-400 font-semibold">Admin Key:</span>
              <code className="font-mono font-bold text-white">ADMIN@CAMPUS2026</code>
              <button
                type="button"
                onClick={() => copyToClipboard('admin', 'ADMIN@CAMPUS2026')}
                className="p-1 text-slate-400 hover:text-white"
                title="Copy Admin Key"
              >
                {copiedKey === 'admin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <Link
              href="/admin/users"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 ml-1 flex items-center gap-1"
            >
              Manage Users <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Complaints Metrics */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Complaints Status Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Complaints</span>
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.total ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">All time campus tickets</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Assignment</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-amber-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.pending ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">Require technician assignment</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
                <Wrench className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-extrabold text-indigo-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.in_progress ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">Currently being serviced</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats?.complaints?.resolved ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">Repairs completed</p>
            </div>
          </div>
        </div>

        {/* Equipment & Infrastructure Health Metrics */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Infrastructure & Equipment Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/admin/equipment?status=Working"
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-green-300 transition-colors"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Working Equip</span>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {loading ? '—' : stats?.equipment?.working ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Operational</p>
            </Link>

            <Link
              href="/admin/equipment?status=Not Working"
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-red-300 transition-colors"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Faulty Equip</span>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {loading ? '—' : stats?.equipment?.not_working ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Needs Attention</p>
            </Link>

            <Link
              href="/admin/buildings"
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Buildings</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? '—' : stats?.infrastructure?.buildings ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Blocks</p>
            </Link>

            <Link
              href="/admin/floors"
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Floors</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? '—' : stats?.infrastructure?.floors ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Levels</p>
            </Link>

            <Link
              href="/admin/rooms"
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Rooms & Labs</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? '—' : stats?.infrastructure?.rooms ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Facilities</p>
            </Link>

            <Link
              href="/admin/users"
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-colors"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Technicians</span>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {loading ? '—' : stats?.users?.technicians ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Active Staff</p>
            </Link>
          </div>
        </div>

        {/* Complaints Table with Quick Assignment */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Complaints & Ticket Operations</h2>
              <p className="text-xs text-slate-500">Assign technicians, track status, and monitor repair remarks</p>
            </div>
            <Link
              href="/admin/complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Complaints <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No complaints logged in system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Equipment</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Technician</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.slice(0, 8).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {c.ticket_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{c.equipment_name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{c.equipment_id_str}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{c.building_name}</div>
                        <div className="text-[11px] text-slate-400">{c.floor_name} • {c.room_name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium">{c.student_name}</div>
                        <div className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {c.assigned_to_name ? (
                          <span className="text-blue-700 font-semibold">{c.assigned_to_name}</span>
                        ) : (
                          <span className="text-amber-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {c.status !== 'Resolved' && (
                          <button
                            onClick={() => handleOpenAssign(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                          >
                            <UserCheck className="w-3 h-3" />
                            {c.assigned_to ? 'Reassign' : 'Assign'}
                          </button>
                        )}
                        <Link
                          href={`/admin/equipment/${c.equipment}/history`}
                          title="View Equipment Complaint History"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Clock className="w-3 h-3" />
                          History
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assign Modal */}
        <AssignTechnicianModal
          complaint={selectedComplaint}
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={handleAssignSuccess}
        />
      </div>
    </ProtectedRoute>
  );
}
