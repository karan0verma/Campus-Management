'use client';

import React, { useState, useEffect } from 'react';
import { Complaint, User, api } from '@/lib/api';
import { X, UserCheck, Loader2, AlertCircle } from 'lucide-react';

interface AssignTechnicianModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Complaint) => void;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<number | ''>('');
  const [loadingTechs, setLoadingTechs] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingTechs(true);
      setError(null);
      api.getTechnicians()
        .then((techs) => {
          setTechnicians(techs);
          if (complaint?.assigned_to) {
            setSelectedTechId(complaint.assigned_to);
          } else if (techs.length > 0) {
            setSelectedTechId(techs[0].id);
          }
        })
        .catch((err) => setError('Failed to load technician list.'))
        .finally(() => setLoadingTechs(false));
    }
  }, [isOpen, complaint]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;

    setSubmitting(true);
    setError(null);
    try {
      const updated = await api.assignComplaint(complaint.id, Number(selectedTechId));
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign technician.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Assign Technician</h3>
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

        <div className="mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Equipment:</span>
            <span className="text-slate-800 font-semibold">{complaint.equipment_name} ({complaint.equipment_id_str})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Location:</span>
            <span className="text-slate-800">{complaint.building_name} &gt; {complaint.floor_name} &gt; {complaint.room_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Reported by:</span>
            <span className="text-slate-800">{complaint.student_name}</span>
          </div>
          <div className="pt-1 text-slate-600 italic">
            "{complaint.description}"
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Registered Technician
            </label>
            {loadingTechs ? (
              <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Loading registered technicians...
              </div>
            ) : (
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(Number(e.target.value))}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              >
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.first_name} {tech.last_name} ({tech.username}) - {tech.department || 'General Maintenance'}
                  </option>
                ))}
              </select>
            )}
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
              disabled={submitting || !selectedTechId}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Confirm Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
