'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Building, Floor, Room, Equipment, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Clock,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Building2,
  DoorOpen,
  Power
} from 'lucide-react';

function EquipmentContent() {
  const searchParams = useSearchParams();
  const initialRoom = searchParams.get('room') || '';
  const initialStatus = searchParams.get('status') || '';

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>(initialRoom);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [search, setSearch] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formRoom, setFormRoom] = useState<number | ''>('');
  const [formName, setFormName] = useState<string>('');
  const [formEquipmentId, setFormEquipmentId] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Working' | 'Not Working'>('Working');
  const [submitting, setSubmitting] = useState(false);

  // Bulk Generator Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkRoom, setBulkRoom] = useState<number | ''>('');
  const [bulkName, setBulkName] = useState<string>('Computer');
  const [bulkPrefix, setBulkPrefix] = useState<string>('PC-');
  const [bulkCount, setBulkCount] = useState<number>(10);
  const [bulkStart, setBulkStart] = useState<number>(1);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Load layout dropdown filters
  useEffect(() => {
    Promise.all([
      api.getBuildings(),
      api.getFloors(),
      api.getRooms(),
    ]).then(([bldgs, flrs, rms]) => {
      setBuildings(bldgs);
      setFloors(flrs);
      setRooms(rms);
    }).catch(console.error);
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const data = await api.getEquipment({
        room: selectedRoom ? Number(selectedRoom) : undefined,
        floor: selectedFloor ? Number(selectedFloor) : undefined,
        building: selectedBuilding ? Number(selectedBuilding) : undefined,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setEquipmentList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load equipment list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedBuilding, selectedFloor, selectedRoom, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEquipment();
  };

  const handleToggleStatus = async (eq: Equipment) => {
    const nextStatus = eq.status === 'Working' ? 'Not Working' : 'Working';
    try {
      const updated = await api.updateEquipmentStatus(eq.id, nextStatus);
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const openCreateModal = () => {
    setEditingEquipment(null);
    setFormRoom(selectedRoom ? Number(selectedRoom) : (rooms[0]?.id || ''));
    setFormName('');
    setFormEquipmentId('');
    setFormStatus('Working');
    setModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormRoom(eq.room);
    setFormName(eq.name);
    setFormEquipmentId(eq.equipment_id);
    setFormStatus(eq.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoom) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingEquipment) {
        const updated = await api.updateEquipment(editingEquipment.id, {
          room: Number(formRoom),
          name: formName.trim(),
          equipment_id: formEquipmentId.trim().toUpperCase(),
          status: formStatus,
        });
        setEquipmentList((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        const created = await api.createEquipment({
          room: Number(formRoom),
          name: formName.trim(),
          equipment_id: formEquipmentId.trim().toUpperCase(),
          status: formStatus,
        });
        setEquipmentList((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const openBulkModal = () => {
    setBulkRoom(selectedRoom ? Number(selectedRoom) : (rooms[0]?.id || ''));
    setBulkName('Computer');
    setBulkPrefix('PC-');
    setBulkCount(10);
    setBulkStart(1);
    setBulkModalOpen(true);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkRoom || !bulkPrefix.trim()) return;

    setBulkSubmitting(true);
    setError(null);

    try {
      const created = await api.bulkCreateEquipment({
        room: Number(bulkRoom),
        name: bulkName.trim(),
        prefix: bulkPrefix.trim().toUpperCase(),
        count: Number(bulkCount),
        start: Number(bulkStart),
      });
      setEquipmentList((prev) => [...created, ...prev]);
      setBulkModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Bulk generation failed.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage College Equipment</h1>
          <p className="text-sm text-slate-500 mt-1">
            Register and monitor individually tracked equipment items with unique IDs across campus labs and rooms.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={openBulkModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Cpu className="w-4 h-4 text-blue-600" />
            Bulk Generator
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Register Single
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID (e.g. PC-001) or Name..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </form>

          {/* Status Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {['', 'Working', 'Not Working'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === '' ? 'All Equipment' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Building</label>
            <select
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setSelectedFloor('');
                setSelectedRoom('');
              }}
              className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-800"
            >
              <option value="">All Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Floor</label>
            <select
              value={selectedFloor}
              onChange={(e) => {
                setSelectedFloor(e.target.value);
                setSelectedRoom('');
              }}
              className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-800"
            >
              <option value="">All Floors</option>
              {floors
                .filter((f) => !selectedBuilding || f.building === Number(selectedBuilding))
                .map((f) => (
                  <option key={f.id} value={f.id}>{f.building_name} - {f.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Room / Lab</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-800"
            >
              <option value="">All Rooms</option>
              {rooms
                .filter((r) => !selectedFloor || r.floor === Number(selectedFloor))
                .map((r) => (
                  <option key={r.id} value={r.id}>{r.name} (Room {r.room_number})</option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading equipment inventory...</p>
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Equipment Found</h3>
          <p className="text-xs text-slate-500 mt-1">Register new equipment in rooms or adjust filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Unique Equipment ID</th>
                  <th className="py-3 px-4">Equipment Name</th>
                  <th className="py-3 px-4">Room / Lab</th>
                  <th className="py-3 px-4">Building & Floor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Complaints History</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 bg-blue-50/40">
                      {eq.equipment_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {eq.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {eq.room_name} ({eq.room_number})
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {eq.building_name} &gt; {eq.floor_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={eq.status} size="sm" />
                        <button
                          onClick={() => handleToggleStatus(eq)}
                          title="Toggle Working / Not Working status"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/equipment/${eq.id}/history`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{eq.complaints_count} Records</span>
                        {eq.active_complaints_count > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Active Issue" />
                        )}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(eq)}
                        title="Edit Equipment"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingEquipment ? 'Edit Equipment' : 'Register Equipment'}
                  </h3>
                  <p className="text-xs text-slate-500">Every equipment item must have a unique ID</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Room / Laboratory
                </label>
                <select
                  value={formRoom}
                  onChange={(e) => setFormRoom(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Room {r.room_number}) • {r.building_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Equipment Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Computer, Air Conditioner, Digital Projector, Ceiling Fan"
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unique Equipment ID
                </label>
                <input
                  type="text"
                  value={formEquipmentId}
                  onChange={(e) => setFormEquipmentId(e.target.value)}
                  placeholder="e.g. PC-001, AC-001, PROJ-001, FAN-001"
                  className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Must be unique across the entire college.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Working' | 'Not Working')}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Working">Working</option>
                  <option value="Not Working">Not Working</option>
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
                    editingEquipment ? 'Update Equipment' : 'Register Equipment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Equipment Generator Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bulk Equipment Generator</h3>
                  <p className="text-xs text-slate-500">Auto-generate 10, 20, 30+ sequential equipment IDs</p>
                </div>
              </div>
              <button onClick={() => setBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Room / Laboratory
                </label>
                <select
                  value={bulkRoom}
                  onChange={(e) => setBulkRoom(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Room {r.room_number}) • {r.building_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Equipment Category / Name
                </label>
                <input
                  type="text"
                  value={bulkName}
                  onChange={(e) => setBulkName(e.target.value)}
                  placeholder="e.g. Computer, Ceiling Fan, Air Conditioner, Projector, Bench"
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ID Prefix
                  </label>
                  <input
                    type="text"
                    value={bulkPrefix}
                    onChange={(e) => setBulkPrefix(e.target.value)}
                    placeholder="e.g. PC-, AC-, FAN-"
                    className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start At #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bulkStart}
                    onChange={(e) => setBulkStart(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-slate-700">Preview generated equipment IDs:</p>
                <p className="font-mono text-blue-700 font-bold">
                  {bulkPrefix.toUpperCase()}{String(bulkStart).padStart(2, '0')}, {bulkPrefix.toUpperCase()}{String(bulkStart + 1).padStart(2, '0')}, ... {bulkPrefix.toUpperCase()}{String(bulkStart + bulkCount - 1).padStart(2, '0')}
                </p>
                <p className="text-[11px] text-slate-400">Total: {bulkCount} items will be registered in one click.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  disabled={bulkSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSubmitting || !bulkRoom || !bulkPrefix.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {bulkSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    `Generate ${bulkCount} Items`
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

export default function AdminEquipmentPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Suspense fallback={
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading...
        </div>
      }>
        <EquipmentContent />
      </Suspense>
    </ProtectedRoute>
  );
}
