'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TreeBuilding, Equipment, api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Building2,
  Layers,
  DoorOpen,
  Cpu,
  ChevronRight,
  PlusCircle,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function StudentLayoutPage() {
  const [tree, setTree] = useState<TreeBuilding[]>([]);
  const [loadingTree, setLoadingTree] = useState(true);

  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  useEffect(() => {
    api.getLayoutTree()
      .then((data) => {
        setTree(data);
        if (data.length > 0) {
          setSelectedBuildingId(data[0].id);
          if (data[0].floors.length > 0) {
            setSelectedFloorId(data[0].floors[0].id);
            if (data[0].floors[0].rooms.length > 0) {
              setSelectedRoomId(data[0].floors[0].rooms[0].id);
            }
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingTree(false));
  }, []);

  const currentBuilding = tree.find((b) => b.id === selectedBuildingId);
  const currentFloor = currentBuilding?.floors.find((f) => f.id === selectedFloorId);
  const currentRoom = currentFloor?.rooms.find((r) => r.id === selectedRoomId);

  // Load equipment when selected room changes
  useEffect(() => {
    if (selectedRoomId) {
      setLoadingEquipment(true);
      api.getEquipment({ room: selectedRoomId })
        .then((items) => setEquipmentList(items))
        .catch((err) => console.error(err))
        .finally(() => setLoadingEquipment(false));
    } else {
      setEquipmentList([]);
    }
  }, [selectedRoomId]);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>College Campus</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">{currentBuilding?.name || 'Select Building'}</span>
            {currentFloor && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-blue-600">{currentFloor.name}</span>
              </>
            )}
            {currentRoom && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-900 font-bold">{currentRoom.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">College Infrastructure Layout</h1>
          <p className="text-sm text-slate-500 mt-1">
            Navigate through buildings, floors, and rooms to view equipment and report issues.
          </p>
        </div>

        {loadingTree ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading digital college infrastructure...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Step 1: Buildings & Floors Selector */}
            <div className="lg:col-span-4 space-y-6">
              {/* Buildings List */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  1. Select Building
                </h3>
                <div className="space-y-2">
                  {tree.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBuildingId(b.id);
                        if (b.floors.length > 0) {
                          setSelectedFloorId(b.floors[0].id);
                          if (b.floors[0].rooms.length > 0) {
                            setSelectedRoomId(b.floors[0].rooms[0].id);
                          } else {
                            setSelectedRoomId(null);
                          }
                        } else {
                          setSelectedFloorId(null);
                          setSelectedRoomId(null);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${
                        selectedBuildingId === b.id
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{b.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {b.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-1">
                        {b.floors_count} {b.floors_count === 1 ? 'Floor' : 'Floors'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Floors List */}
              {currentBuilding && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    2. Select Floor
                  </h3>
                  {currentBuilding.floors.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No floors registered in this building.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentBuilding.floors.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setSelectedFloorId(f.id);
                            if (f.rooms.length > 0) {
                              setSelectedRoomId(f.rooms[0].id);
                            } else {
                              setSelectedRoomId(null);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                            selectedFloorId === f.id
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <p className="font-semibold">{f.name}</p>
                          <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                            {f.rooms_count} {f.rooms_count === 1 ? 'Room' : 'Rooms'}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2 & 3: Rooms and Equipment Section */}
            <div className="lg:col-span-8 space-y-6">
              {/* Rooms in Current Floor */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <DoorOpen className="w-4 h-4 text-blue-600" />
                    3. Select Room / Laboratory
                  </h3>
                  {currentFloor && (
                    <span className="text-xs text-slate-400">
                      {currentBuilding?.name} &gt; {currentFloor.name}
                    </span>
                  )}
                </div>

                {!currentFloor || currentFloor.rooms.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No rooms found on this floor.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {currentFloor.rooms.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRoomId(r.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          selectedRoomId === r.id
                            ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Room {r.room_number}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">{r.room_type}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-2 truncate">{r.name}</h4>
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>{r.equipment_count} Equipment</span>
                          {r.faulty_count > 0 && (
                            <span className="text-amber-600 font-semibold">• {r.faulty_count} down</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipment Inventory in Selected Room */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      Equipment in {currentRoom ? `${currentRoom.name} (${currentRoom.room_number})` : 'Room'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      View working status and click to submit a maintenance complaint.
                    </p>
                  </div>
                </div>

                {loadingEquipment ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Loading equipment...</p>
                  </div>
                ) : equipmentList.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No equipment currently registered in this room.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {equipmentList.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {eq.equipment_id}
                            </span>
                            <StatusBadge status={eq.status} size="sm" />
                            {eq.active_complaints_count > 0 && (
                              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                                {eq.active_complaints_count} Active Issue
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900">{eq.name}</h4>
                          <p className="text-xs text-slate-500">
                            {eq.building_name} • {eq.floor_name} • {eq.room_name} ({eq.room_number})
                          </p>
                        </div>

                        <div>
                          <Link
                            href={`/student/complaints/new?equipment=${eq.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Report Problem
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
