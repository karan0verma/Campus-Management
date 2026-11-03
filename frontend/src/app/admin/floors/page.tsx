'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Building, Floor, api } from '@/lib/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Building2,
  DoorOpen
} from 'lucide-react';

function FloorsContent() {
  const searchParams = useSearchParams();
  const initialBuilding = searchParams.get('building') || '';

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>(initialBuilding);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [formBuilding, setFormBuilding] = useState<number | ''>('');
  const [formNumber, setFormNumber] = useState<number | ''>(0);
  const [formName, setFormName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bldgs, flrs] = await Promise.all([
        api.getBuildings(),
        api.getFloors(selectedBuilding ? Number(selectedBuilding) : undefined),
      ]);
      setBuildings(bldgs);
      setFloors(flrs);
    } catch (err: any) {
      setError(err.message || 'Failed to load floors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBuilding]);

  const openCreateModal = () => {
    setEditingFloor(null);
    setFormBuilding(selectedBuilding ? Number(selectedBuilding) : (buildings[0]?.id || ''));
    setFormNumber(floors.length);
    setFormName('');
    setModalOpen(true);
  };

  const openEditModal = (f: Floor) => {
    setEditingFloor(f);
    setFormBuilding(f.building);
    setFormNumber(f.floor_number);
    setFormName(f.name);
    setModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete floor "${name}"? This will delete associated rooms and equipment.`)) {
      return;
    }
    try {
      await api.deleteFloor(id);
      setFloors((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete floor.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBuilding) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingFloor) {
        const updated = await api.updateFloor(editingFloor.id, {
          building: Number(formBuilding),
          floor_number: Number(formNumber),
          name: formName.trim(),
        });
        setFloors((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const created = await api.createFloor({
          building: Number(formBuilding),
          floor_number: Number(formNumber),
          name: formName.trim(),
        });
        setFloors((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Building Floors</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure floor levels and map them to their parent college building.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Floor
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Building Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Filter by Building:</label>
        <select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="text-sm border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Buildings</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {/* Floors Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading floors...</p>
        </div>
      ) : floors.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Floors Found</h3>
          <p className="text-xs text-slate-500 mt-1">Add floors to your selected building block.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Building</th>
                  <th className="py-3 px-4">Floor Level</th>
                  <th className="py-3 px-4">Floor Name</th>
                  <th className="py-3 px-4">Rooms / Labs</th>
                  <th className="py-3 px-4">Total Equipment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {floors.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {f.building_name}
                      <span className="font-mono text-[10px] text-slate-400">({f.building_code})</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      Level {f.floor_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {f.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        <DoorOpen className="w-3 h-3 text-slate-400" />
                        {f.rooms_count} Rooms
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {f.equipment_count} Items
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/rooms?floor=${f.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      >
                        Rooms &rarr;
                      </Link>
                      <button
                        onClick={() => openEditModal(f)}
                        title="Edit Floor"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
                        title="Delete Floor"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingFloor ? 'Edit Floor' : 'Add Floor to Building'}
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
                  Parent Building
                </label>
                <select
                  value={formBuilding}
                  onChange={(e) => setFormBuilding(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Building --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Floor Level Number (0 for Ground, 1, 2...)
                </label>
                <input
                  type="number"
                  value={formNumber}
                  onChange={(e) => setFormNumber(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Floor Display Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ground Floor, First Floor, Mezzanine"
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
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
                    editingFloor ? 'Update Floor' : 'Create Floor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFloorsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Suspense fallback={
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading...
        </div>
      }>
        <FloorsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
