'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Complaint, User, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { AssignTechnicianModal } from '@/components/AssignTechnicianModal';
import {
  AlertCircle,
  Search,
  UserCheck,
  Clock,
  Calendar,
  MapPin,
  Cpu,
  Loader2,
  Filter,
  ArrowRight
} from 'lucide-react';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [technicianFilter, setTechnicianFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Assign Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({
        status: statusFilter || undefined,
        technician: technicianFilter ? Number(technicianFilter) : undefined,
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
    api.getTechnicians().then(setTechnicians).catch(console.error);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, technicianFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleOpenAssign = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = (updated: Complaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Campus Maintenance Complaints</h1>
          <p className="text-sm text-slate-500 mt-1">
            Central ticket board: Monitor complaints, assign technicians, track repair remarks, and audit resolution timelines.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID, equipment, student..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Technician dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-500 font-semibold">Technician:</label>
              <select
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                className="border border-slate-300 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-800 text-xs"
              >
                <option value="">All Technicians</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.username})</option>
                ))}
              </select>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
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
                  {st === '' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Complaints Match</h3>
            <p className="text-xs text-slate-500 mt-1">Adjust filters or search query to find tickets.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
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
                      <span className="font-semibold text-slate-700">{c.building_name}</span> &gt; {c.floor_name} &gt; {c.room_name} ({c.room_number})
                    </p>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800">Reported by {c.student_name}:</span> "{c.description}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right text-xs">
                    <p className="text-slate-400 text-[11px]">Assigned Technician</p>
                    <p className="font-semibold text-slate-800">
                      {c.assigned_to_name ? (
                        <span className="text-blue-700">{c.assigned_to_name}</span>
                      ) : (
                        <span className="text-amber-600 italic">Unassigned</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {c.status !== 'Resolved' && (
                      <button
                        onClick={() => handleOpenAssign(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {c.assigned_to ? 'Reassign' : 'Assign Technician'}
                      </button>
                    )}

                    <Link
                      href={`/admin/equipment/${c.equipment}/history`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Equipment History
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
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
