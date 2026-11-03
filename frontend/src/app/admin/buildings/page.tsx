'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Building, api } from '@/lib/api';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Layers,
  DoorOpen,
  Cpu
} from 'lucide-react';

export default function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const data = await api.getBuildings();
      setBuildings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load buildings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const openCreateModal = () => {
    setEditingBuilding(null);
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setModalOpen(true);
  };

  const openEditModal = (b: Building) => {
    setEditingBuilding(b);
    setFormName(b.name);
    setFormCode(b.code);
    setFormDesc(b.description || '');
    setModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete building "${name}"? This will delete associated floors, rooms, and equipment.`)) {
      return;
    }
    try {
      await api.deleteBuilding(id);
      setBuildings((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete building.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingBuilding) {
        const updated = await api.updateBuilding(editingBuilding.id, {
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          description: formDesc.trim(),
        });
        setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        const created = await api.createBuilding({
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          description: formDesc.trim(),
        });
        setBuildings((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Campus Buildings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Create, update, and manage high-level college building blocks.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Building
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Buildings Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading buildings...</p>
          </div>
        ) : buildings.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Buildings Created</h3>
            <p className="text-xs text-slate-500 mt-1">Add your college's first academic or administrative block.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {buildings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {b.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {b.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-xs font-bold text-slate-900">{b.floors_count}</p>
                      <p className="text-[10px] text-slate-500">Floors</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-xs font-bold text-slate-900">{b.rooms_count}</p>
                      <p className="text-[10px] text-slate-500">Rooms</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-xs font-bold text-slate-900">{b.equipment_count}</p>
                      <p className="text-[10px] text-slate-500">Equipment</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <Link
                    href={`/admin/floors?building=${b.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View Floors &rarr;
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(b)}
                      title="Edit Building"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.name)}
                      title="Delete Building"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingBuilding ? 'Edit Building' : 'Add New Building'}
                    </h3>
                    <p className="text-xs text-slate-500">College Infrastructure Hierarchy</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Building Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Engineering Block A"
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Building Code
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. ENG-A"
                    className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Brief description of departments and laboratories housed..."
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingBuilding ? 'Update Building' : 'Create Building'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
