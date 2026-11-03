'use client';

import React, { useState } from 'react';
import { Complaint, api } from '@/lib/api';
import { X, Wrench, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface UpdateStatusModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Complaint) => void;
  defaultStatus?: 'In Progress' | 'Resolved';
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onSuccess,
  defaultStatus = 'In Progress',
}) => {
  const [targetStatus, setTargetStatus] = useState<'In Progress' | 'Resolved'>(defaultStatus);
  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTargetStatus(defaultStatus);
      setRemarks('');
      setError(null);
    }
  }, [isOpen, defaultStatus]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStatus === 'Resolved' && !remarks.trim()) {
      setError('Repair remarks are required when marking a complaint as Resolved.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await api.updateComplaintStatus(complaint.id, {
        status: targetStatus,
        remarks: remarks.trim() || `Status updated to ${targetStatus}`,
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update repair status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              targetStatus === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {targetStatus === 'Resolved' ? <CheckCircle2 className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {targetStatus === 'Resolved' ? 'Complete & Resolve Complaint' : 'Update Repair Progress'}
              </h3>
              <p className="text-xs text-slate-500">Ticket: {complaint.ticket_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="font-semibold text-slate-800">
            {complaint.equipment_name} ({complaint.equipment_id_str})
          </div>
          <div className="text-slate-500">
            {complaint.building_name} &gt; {complaint.floor_name} &gt; {complaint.room_name}
          </div>
          <div className="text-slate-600 italic pt-1">
            "{complaint.description}"
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetStatus('In Progress')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  targetStatus === 'In Progress'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-4 h-4" />
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setTargetStatus('Resolved')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  targetStatus === 'Resolved'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Resolved (Fixed)
              </button>
            </div>
            {targetStatus === 'Resolved' && (
              <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">
                * Marking as Resolved will restore equipment status to "Working".
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Repair Remarks {targetStatus === 'Resolved' ? <span className="text-red-500">*</span> : '(Optional)'}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                targetStatus === 'Resolved'
                  ? 'Describe what was fixed (e.g., Replaced power supply unit, tested voltages, normal operation restored)...'
                  : 'Add notes about diagnosis, replacement parts needed, or ongoing tests...'
              }
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
              required={targetStatus === 'Resolved'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 ${
                targetStatus === 'Resolved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : targetStatus === 'Resolved' ? (
                'Mark as Resolved'
              ) : (
                'Update Progress'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
