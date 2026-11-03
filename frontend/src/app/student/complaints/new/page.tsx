'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Building, Floor, Room, Equipment, api } from '@/lib/api';
import {
  Building2,
  Layers,
  DoorOpen,
  Cpu,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

function RaiseComplaintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEquipmentId = searchParams.get('equipment');

  // Hierarchy selections
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  const [selectedBuilding, setSelectedBuilding] = useState<number | ''>('');
  const [selectedFloor, setSelectedFloor] = useState<number | ''>('');
  const [selectedRoom, setSelectedRoom] = useState<number | ''>('');
  const [selectedEquipment, setSelectedEquipment] = useState<number | ''>('');
  const [description, setDescription] = useState<string>('');

  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingFloors, setLoadingFloors] = useState<boolean>(false);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [loadingEquipment, setLoadingEquipment] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load buildings initially
  useEffect(() => {
    async function init() {
      try {
        const bldgs = await api.getBuildings();
        setBuildings(bldgs);

        // If preselected equipment ID was passed in URL
        if (preselectedEquipmentId) {
          const allEq = await api.getEquipment();
          const targetEq = allEq.find((e) => e.id === Number(preselectedEquipmentId));
          if (targetEq) {
            setSelectedBuilding(targetEq.building_id);
            const flrs = await api.getFloors(targetEq.building_id);
            setFloors(flrs);
            setSelectedFloor(targetEq.floor_id);

            const rms = await api.getRooms(targetEq.floor_id);
            setRooms(rms);
            setSelectedRoom(targetEq.room);

            const eqs = await api.getEquipment({ room: targetEq.room });
            setEquipmentList(eqs);
            setSelectedEquipment(targetEq.id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInitial(false);
      }
    }
    init();
  }, [preselectedEquipmentId]);

  // When building changes, load floors
  const handleBuildingChange = async (bId: number) => {
    setSelectedBuilding(bId);
    setSelectedFloor('');
    setSelectedRoom('');
    setSelectedEquipment('');
    setFloors([]);
    setRooms([]);
    setEquipmentList([]);

    if (bId) {
      setLoadingFloors(true);
      try {
        const flrs = await api.getFloors(bId);
        setFloors(flrs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFloors(false);
      }
    }
  };

  // When floor changes, load rooms
  const handleFloorChange = async (fId: number) => {
    setSelectedFloor(fId);
    setSelectedRoom('');
    setSelectedEquipment('');
    setRooms([]);
    setEquipmentList([]);

    if (fId) {
      setLoadingRooms(true);
      try {
        const rms = await api.getRooms(fId);
        setRooms(rms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRooms(false);
      }
    }
  };

  // When room changes, load equipment
  const handleRoomChange = async (rId: number) => {
    setSelectedRoom(rId);
    setSelectedEquipment('');
    setEquipmentList([]);

    if (rId) {
      setLoadingEquipment(true);
      try {
        const eqs = await api.getEquipment({ room: rId });
        setEquipmentList(eqs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEquipment(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) {
      setError('Please select an equipment item.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a complaint description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await api.createComplaint({
        equipment: Number(selectedEquipment),
        description: description.trim(),
      });
      router.push(`/student/complaints/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint.');
      setSubmitting(false);
    }
  };

  const selectedEquipmentItem = equipmentList.find((e) => e.id === Number(selectedEquipment));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Raise Infrastructure Complaint</h1>
        <p className="text-sm text-slate-500 mt-1">
          Follow the layout hierarchy to pinpoint the faulty equipment and file an official repair request.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {loadingInitial ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading infrastructure options...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Building */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                1. Building
              </label>
              <select
                value={selectedBuilding}
                onChange={(e) => handleBuildingChange(Number(e.target.value))}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Choose Building --</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Floor */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                2. Floor
              </label>
              <select
                value={selectedFloor}
                onChange={(e) => handleFloorChange(Number(e.target.value))}
                disabled={!selectedBuilding || loadingFloors}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
              >
                <option value="">
                  {loadingFloors ? 'Loading floors...' : '-- Choose Floor --'}
                </option>
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Room */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-blue-600" />
                3. Room / Laboratory
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => handleRoomChange(Number(e.target.value))}
                disabled={!selectedFloor || loadingRooms}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
              >
                <option value="">
                  {loadingRooms ? 'Loading rooms...' : '-- Choose Room / Lab --'}
                </option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (Room {r.room_number})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Equipment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                4. Select Equipment
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(Number(e.target.value))}
                disabled={!selectedRoom || loadingEquipment}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
              >
                <option value="">
                  {loadingEquipment ? 'Loading equipment...' : '-- Choose Equipment --'}
                </option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} — {eq.equipment_id} ({eq.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Equipment Pill */}
          {selectedEquipmentItem && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedEquipmentItem.name} • <span className="font-mono text-blue-700">{selectedEquipmentItem.equipment_id}</span>
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Location: {selectedEquipmentItem.building_name} &gt; {selectedEquipmentItem.floor_name} &gt; {selectedEquipmentItem.room_name}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                selectedEquipmentItem.status === 'Working'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Current: {selectedEquipmentItem.status}
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              5. Complaint Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem in detail (e.g., Computer power supply not turning on, burning smell from SMPS, display flickering, air conditioner not cooling, etc.)..."
              className="w-full text-sm border border-slate-300 rounded-xl p-3.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedEquipment}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Ticket...
                </>
              ) : (
                <>
                  Submit Complaint <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function RaiseComplaintPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Suspense fallback={
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading...
        </div>
      }>
        <RaiseComplaintContent />
      </Suspense>
    </ProtectedRoute>
  );
}
