'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Complaint, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { UpdateStatusModal } from '@/components/UpdateStatusModal';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Cpu,
  MapPin,
  MessageSquare,
  Wrench,
  Loader2,
  AlertCircle,
  Clock,
  User as UserIcon,
  Phone,
  Mail
} from 'lucide-react';

export default function TechnicianComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = Number(params.id);

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'In Progress' | 'Resolved'>('In Progress');

  const fetchComplaint = () => {
    if (!complaintId) return;
    setLoading(true);
    api.getComplaint(complaintId)
      .then((data) => setComplaint(data))
      .catch((err) => setError(err.message || 'Failed to load complaint details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const handleOpenModal = (status: 'In Progress' | 'Resolved') => {
    setModalStatus(status);
    setModalOpen(true);
  };

  const handleUpdateSuccess = (updated: Complaint) => {
    setComplaint(updated);
  };

  return (
    <ProtectedRoute allowedRoles={['technician']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => router.push('/technician/complaints')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assigned Complaints
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading complaint...</p>
          </div>
        ) : !complaint ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 text-slate-500">
            Complaint not found.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Actions Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {complaint.ticket_id}
                  </span>
                  <StatusBadge status={complaint.status} size="md" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  {complaint.equipment_name} Repair Workorder
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Reported on {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>

              {/* Technician Actions */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {complaint.status !== 'Resolved' ? (
                  <>
                    {complaint.status === 'Assigned' && (
                      <button
                        onClick={() => handleOpenModal('In Progress')}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-2"
                      >
                        <Wrench className="w-4 h-4" />
                        Start Work
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal('Resolved')}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete & Mark Resolved
                    </button>
                  </>
                ) : (
                  <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Repair Completed
                  </div>
                )}
              </div>
            </div>

            {/* Equipment & Student info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Target Equipment & Location
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Equipment:</span>
                    <span className="font-semibold text-slate-800">{complaint.equipment_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Equipment Unique ID:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                      {complaint.equipment_id_str}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Building:</span>
                    <span className="font-medium text-slate-800">{complaint.building_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Floor & Room:</span>
                    <span className="font-medium text-slate-800">{complaint.floor_name} • {complaint.room_name} ({complaint.room_number})</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  Student Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-semibold text-slate-800">{complaint.student_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {complaint.student_email || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {complaint.student_phone || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Reported Complaint Details
              </h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Timeline of repair remarks */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Repair Activity & Remarks
                </h3>
                {complaint.status !== 'Resolved' && (
                  <button
                    onClick={() => handleOpenModal('In Progress')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    + Add Progress Remark
                  </button>
                )}
              </div>

              {(!complaint.remarks || complaint.remarks.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No remarks recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {complaint.remarks.map((rem) => (
                    <div key={rem.id} className="relative">
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {rem.technician_name}
                            <span className="font-normal text-slate-400">• Transition:</span>
                            <span className="font-medium text-blue-700">{rem.status_from || 'Created'} &rarr; {rem.status_to}</span>
                          </span>
                          <span className="text-slate-400">
                            {new Date(rem.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 pt-1">
                          {rem.remarks}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <UpdateStatusModal
          complaint={complaint}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleUpdateSuccess}
          defaultStatus={modalStatus}
        />
      </div>
    </ProtectedRoute>
  );
}
