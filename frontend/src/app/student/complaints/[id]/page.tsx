'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Complaint, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  DoorOpen,
  Loader2,
  MapPin,
  MessageSquare,
  UserCheck,
  Wrench
} from 'lucide-react';

export default function StudentComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = Number(params.id);

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId) return;

    api.getComplaint(complaintId)
      .then((data) => setComplaint(data))
      .catch((err) => setError(err.message || 'Failed to load complaint details.'))
      .finally(() => setLoading(false));
  }, [complaintId]);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Back Link */}
        <button
          onClick={() => router.push('/student/complaints')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Complaints
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
            <p className="text-sm font-medium text-slate-600">Loading complaint ticket...</p>
          </div>
        ) : !complaint ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 text-slate-500">
            Complaint not found.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Ticket Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-base font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {complaint.ticket_id}
                  </span>
                  <StatusBadge status={complaint.status} size="md" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  {complaint.equipment_name} Issue
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted on {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>

              {complaint.resolved_at && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Resolved on {new Date(complaint.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Equipment & Location Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Equipment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Equipment Name:</span>
                    <span className="font-semibold text-slate-800">{complaint.equipment_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Equipment Unique ID:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                      {complaint.equipment_id_str}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Building:</span>
                    <span className="font-semibold text-slate-800">{complaint.building_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Floor:</span>
                    <span className="font-medium text-slate-800">{complaint.floor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Room / Lab:</span>
                    <span className="font-medium text-slate-800">{complaint.room_name} ({complaint.room_number})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Problem Description
              </h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Technician Assignment */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Assigned Technician
              </h3>
              {complaint.assigned_to_name ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {complaint.assigned_to_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{complaint.assigned_to_name}</p>
                    <p className="text-xs text-slate-500">Campus Maintenance Technician</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>The complaint has been logged and is awaiting technician assignment by administrator.</span>
                </div>
              )}
            </div>

            {/* Lifecycle / Repair History Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                Repair Remarks & Status Timeline
              </h3>

              {(!complaint.remarks || complaint.remarks.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No repair activity recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {complaint.remarks.map((rem, idx) => (
                    <div key={rem.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {rem.technician_name}
                            <span className="font-normal text-slate-400">• Status:</span>
                            <span className="font-medium text-blue-700">{rem.status_to}</span>
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
      </div>
    </ProtectedRoute>
  );
}
