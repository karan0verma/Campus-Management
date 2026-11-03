'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Building, Floor, Room, api } from '@/lib/api';
import {
  DoorOpen,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Building2,
  Layers,
  Cpu
} from 'lucide-react';

function RoomsContent() {
  const searchParams = useSearchParams();
  const initialFloor = searchParams.get('floor') || '';

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>(initialFloor);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formFloor, setFormFloor] = useState<number | ''>('');
  const [formNumber, setFormNumber] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formType, setFormType] = useState<string>('Laboratory');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bldgs, flrs, rms] = await Promise.all([
        api.getBuildings(),
        api.getFloors(selectedBuilding ? Number(selectedBuilding) : undefined),
        api.getRooms(
          selectedFloor ? Number(selectedFloor) : undefined,
          selectedBuilding ? Number(selectedBuilding) : undefined
        ),
      ]);
      setBuildings(bldgs);
      setFloors(flrs);
      setRooms(rms);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBuilding, selectedFloor]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormFloor(selectedFloor ? Number(selectedFloor) : (floors[0]?.id || ''));
    setFormNumber('');
    setFormName('');
    setFormType('Laboratory');
    setModalOpen(true);
  };

  const openEditModal = (r: Room) => {
    setEditingRoom(r);
    setFormFloor(r.floor);
    setFormNumber(r.room_number);
    setFormName(r.name);
    setFormType(r.room_type);
    setModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete room "${name}"? This will delete all equipment inside this room.`)) {
      return;
    }
    try {
      await api.deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete room.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFloor) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingRoom) {
        const updated = await api.updateRoom(editingRoom.id, {
          floor: Number(formFloor),
          room_number: formNumber.trim(),
          name: formName.trim(),
          room_type: formType,
        });
        setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await api.createRoom({
          floor: Number(formFloor),
          room_number: formNumber.trim(),
          name: formName.trim(),
          room_type: formType,
        });
        setRooms((prev) => [...prev, created]);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Rooms & Laboratories</h1>
          <p className="text-sm text-slate-500 mt-1">
            Add, configure, and maintain classrooms, computer labs, and departmental facilities.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Room / Lab
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Building:</label>
          <select
            value={selectedBuilding}
            onChange={(e) => {
              setSelectedBuilding(e.target.value);
              setSelectedFloor('');
            }}
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

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Floor:</label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 focus:bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Floors</option>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.building_name} - {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <DoorOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Rooms Found</h3>
          <p className="text-xs text-slate-500 mt-1">Create rooms or labs in your selected building/floor.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Room No.</th>
                  <th className="py-3 px-4">Room / Lab Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location (Building & Floor)</th>
                  <th className="py-3 px-4">Equipment Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      Room {r.room_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {r.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {r.room_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.building_name} &gt; {r.floor_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-blue-600" />
                        {r.equipment_count} Items
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/equipment?room=${r.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      >
                        Equipment &rarr;
                      </Link>
                      <button
                        onClick={() => openEditModal(r)}
                        title="Edit Room"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id, r.name)}
                        title="Delete Room"
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

      {/* Room Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingRoom ? 'Edit Room' : 'Add Room / Laboratory'}
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
                  Floor
                </label>
                <select
                  value={formFloor}
                  onChange={(e) => setFormFloor(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Floor --</option>
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.building_name} - {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Number / Code
                </label>
                <input
                  type="text"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  placeholder="e.g. 101, Lab-201, AUD-1"
                  className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Computer Lab 1, Physics Lab, Seminar Hall"
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Laboratory">Laboratory</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Auditorium">Auditorium</option>
                  <option value="Faculty Room">Faculty Room</option>
                  <option value="Conference Hall">Conference Hall</option>
                  <option value="Library">Library</option>
                  <option value="Administrative Office">Administrative Office</option>
                </select>
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
                    editingRoom ? 'Update Room' : 'Create Room'
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

export default function AdminRoomsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Suspense fallback={
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading...
        </div>
      }>
        <RoomsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
