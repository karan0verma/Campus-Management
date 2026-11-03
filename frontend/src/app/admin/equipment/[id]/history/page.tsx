'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Equipment, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  MapPin,
  MessageSquare,
  Wrench,
  Loader2,
  AlertCircle,
  Building2,
  DoorOpen,
  UserCheck,
  User as UserIcon
} from 'lucide-react';

interface EquipmentHistoryResponse {
  equipment: Equipment;
  history: Array<{
    ticket_id: string;
    complaint_id: number;
    description: string;
    status: string;
    student_name: string;
    assigned_to: string | null;
    created_at: string;
    resolved_at: string | null;
    remarks: Array<{
      id: number;
      technician: string;
      status_from: string;
      status_to: string;
      remarks: string;
      created_at: string;
    }>;
  }>;
}

export default function EquipmentHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const equipmentId = Number(params.id);

  const [data, setData] = useState<EquipmentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!equipmentId) return;

    api.getEquipmentHistory(equipmentId)
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load equipment maintenance history.'))
      .finally(() => setLoading(false));
  }, [equipmentId]);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <button
          onClick={() => router.push('/admin/equipment')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Equipment Inventory
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
            <p className="text-sm font-medium text-slate-600">Loading equipment maintenance ledger...</p>
          </div>
        ) : !data ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 text-slate-500">
            Equipment history not found.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Equipment Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {data.equipment.equipment_id}
                      </span>
                      <StatusBadge status={data.equipment.status} size="md" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mt-1">{data.equipment.name}</h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {data.equipment.building_name}
                  </span>
                  <span>•</span>
                  <span>{data.equipment.floor_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                    {data.equipment.room_name} ({data.equipment.room_number})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{data.history.length}</p>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Complaints</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-extrabold text-emerald-600">
                    {data.history.filter((h) => h.status === 'Resolved').length}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Resolved Repairs</p>
                </div>
              </div>
            </div>

            {/* Complaint and Repair History Ledger */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Complete Lifecycle & Repair History
              </h2>

              {data.history.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  No maintenance complaints have ever been logged for this equipment item. Perfect working record!
                </div>
              ) : (
                <div className="space-y-5">
                  {data.history.map((item, index) => (
                    <div
                      key={item.ticket_id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      {/* Ticket header */}
                      <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                              {item.ticket_id}
                            </span>
                            <StatusBadge status={item.status} size="sm" />
                            <span className="text-xs text-slate-500">
                              Logged on {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Reported by student: <span className="font-semibold text-slate-800">{item.student_name}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right text-xs">
                          <p className="text-slate-500">Assigned Technician:</p>
                          <p className="font-semibold text-slate-800">
                            {item.assigned_to ? (
                              <span className="text-blue-700">{item.assigned_to}</span>
                            ) : (
                              <span className="text-amber-600 italic">None</span>
                            )}
                          </p>
                          {item.resolved_at && (
                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                              Resolved: {new Date(item.resolved_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Complaint Description */}
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Student Issue Report:
                          </p>
                          <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                            "{item.description}"
                          </p>
                        </div>

                        {/* Remarks Timeline */}
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-blue-600" />
                            Repair Remarks & Action Log:
                          </p>
                          {item.remarks.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No technician actions recorded yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {item.remarks.map((rem) => (
                                <div
                                  key={rem.id}
                                  className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between text-slate-500">
                                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                      {rem.technician}
                                      <span className="font-normal text-slate-400">
                                        ({rem.status_from ? `${rem.status_from} → ` : ''}{rem.status_to})
                                      </span>
                                    </span>
                                    <span>{new Date(rem.created_at).toLocaleString()}</span>
                                  </div>
                                  <p className="text-slate-700 font-medium pt-0.5">
                                    {rem.remarks}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
