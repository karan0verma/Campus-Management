'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Complaint, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { UpdateStatusModal } from '@/components/UpdateStatusModal';
import {
  Wrench,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Cpu,
  ArrowRight
} from 'lucide-react';

export default function TechnicianComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<'In Progress' | 'Resolved'>('In Progress');

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

  const handleOpenModal = (complaint: Complaint, status: 'In Progress' | 'Resolved') => {
    setSelectedComplaint(complaint);
    setModalDefaultStatus(status);
    setModalOpen(true);
  };

  const handleUpdateSuccess = (updated: Complaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  return (
    <ProtectedRoute allowedRoles={['technician']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Maintenance Complaints</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review equipment locations, update repair progress notes, and resolve maintenance tickets.
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
              placeholder="Search ticket, equipment, student..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
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

        {/* Complaints Table/Cards */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Complaints Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {statusFilter
                ? `No assigned complaints match the status "${statusFilter}".`
                : 'No complaints are currently assigned to you.'}
            </p>
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

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">Student ({c.student_name}):</span> "{c.description}"
                  </p>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    href={`/technician/complaints/${c.id}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    View Details
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

        {/* Modal */}
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
