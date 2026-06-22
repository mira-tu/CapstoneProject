import React, { useEffect, useState } from 'react';
import { Lock, MapPin } from 'lucide-react';
import tableyeLogo from '../assets/tableye-logo.png';
import FloorPlanTable, { MergedFloorPlanTable } from '../components/FloorPlanTable';

const statusMeta = {
  vacant: {
    label: 'Available/Unoccupied',
    dot: 'bg-green-500',
    text: 'text-green-300',
    border: 'border-green-500',
    bg: 'bg-green-500/15',
  },
  partial: {
    label: 'Partially Occupied',
    dot: 'bg-yellow-500',
    text: 'text-yellow-300',
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/15',
  },
  full: {
    label: 'Fully Occupied',
    dot: 'bg-red-500',
    text: 'text-red-300',
    border: 'border-red-500',
    bg: 'bg-red-500/15',
  },
  merged: {
    label: 'Merged Table/s',
    dot: 'bg-orange-500',
    text: 'text-orange-300',
    border: 'border-orange-500',
    bg: 'bg-orange-500/15',
  },
  reserved: {
    label: 'Reserved/Under Maintenance',
    dot: 'bg-slate-500',
    text: 'text-slate-300',
    border: 'border-slate-600',
    bg: 'bg-slate-700/60',
  },
  maintenance: {
    label: 'Reserved/Under Maintenance',
    dot: 'bg-slate-500',
    text: 'text-slate-300',
    border: 'border-slate-600',
    bg: 'bg-slate-700/60',
  },
};

// Per-floor labels for the access point shown on the map header. Tables are no
// longer hardcoded here; they are laid out automatically as a seating chart.
const floorAccess = {
  1: { entrance: 'Cashier', access: 'Upstairs' },
  2: { entrance: '', access: 'Downstairs' },
};

const PublicDashboard = ({ tables, onViewChange }) => {
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  const floorSlides = [
    { number: 1, label: 'Dining Area', tables: tables.filter(t => t.floor === 1 || !t.floor) },
    { number: 2, label: '2nd Floor', tables: tables.filter(t => t.floor === 2) },
  ].filter(floor => floor.tables.length > 0);
  const activeFloor = floorSlides[activeFloorIndex] || floorSlides[0];
  const activeAccess = floorAccess[activeFloor?.number] || floorAccess[1];
  const floorVacant = activeFloor?.tables.filter(t => t.status === 'vacant').length || 0;
  const floorFull = activeFloor?.tables.filter(t => t.status === 'full').length || 0;

  useEffect(() => {
    if (floorSlides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveFloorIndex(current => (current + 1) % floorSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [floorSlides.length]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <header className="grid grid-cols-[auto_1fr_auto] items-center border-b border-slate-800 bg-slate-950 px-4 py-3">
        <img
          src={tableyeLogo}
          alt="Tableye Logo"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-700"
        />

        <div className="text-center">
          <h2 className="mt-1 text-3xl font-bold tracking-[0.35em] text-white">TABLEYE</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
            Live Occupancy Dashboard
          </p>
        </div>

        <button
          onClick={() => onViewChange('dashboard')}
          className="ml-auto flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-slate-100 shadow-sm transition hover:bg-slate-700"
          title="Admin View"
        >
          <Lock size={18} />
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center p-4">
        {activeFloor && (
          <section className="flex min-h-0 w-full max-w-7xl flex-1 flex-col rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Area</p>
                  <p className="mt-1 text-3xl font-black text-white">{activeFloor.label}</p>
                </div>
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-300">Available</p>
                  <p className="mt-1 text-3xl font-black text-green-400">{floorVacant} / {activeFloor.tables.length}</p>
                </div>
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-300">Full</p>
                  <p className="mt-1 text-3xl font-black text-white">{floorFull} Table/s</p>
                </div>
              </div>

              {floorSlides.length > 1 && (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4">
                  {floorSlides.map((floor, index) => (
                    <span
                      key={floor.label}
                      className={`h-3 w-3 rounded-full ${index === activeFloorIndex ? 'bg-blue-400' : 'bg-slate-700'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center gap-3">
                <MapPin size={18} className="text-blue-300" />
                <h3 className="text-lg font-black uppercase tracking-[0.22em] text-slate-200">{activeFloor.label} Facility Map</h3>
                <div className="h-px flex-1 bg-slate-800" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{activeAccess.access}</p>
              </div>
              {/* Floor plan canvas — tables are positioned absolutely using their
                  x/y percentages, which come from the Camera Calibration centroids.
                  This reflects the real physical layout of the venue. */}
              <div className="relative min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-800 bg-[linear-gradient(90deg,rgba(51,65,85,0.18)_1px,transparent_1px),linear-gradient(rgba(51,65,85,0.18)_1px,transparent_1px)] bg-[size:42px_42px]">
                {/* Entrance strip */}
                <div className="absolute top-2 left-0 right-0 mx-4 flex h-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200 z-10">
                  <span className="absolute left-4 text-slate-300">{activeAccess.access}</span>
                  {activeAccess.entrance}
                </div>

                {/* Absolutely-positioned table tiles */}
                {(() => {
                  const groups = [];
                  const mergeGroups = {};

                  activeFloor.tables.forEach(table => {
                    if (table.mergeId) {
                      if (!mergeGroups[table.mergeId]) {
                        mergeGroups[table.mergeId] = { mergeId: table.mergeId, tables: [], x: table.x ?? 10, y: table.y ?? 10 };
                        groups.push(mergeGroups[table.mergeId]);
                      }
                      mergeGroups[table.mergeId].tables.push(table);
                    } else {
                      groups.push({ single: table });
                    }
                  });

                  return groups.map(group => {
                    if (group.single) {
                      const t = group.single;
                      // Default position if x/y not yet set by calibration.
                      const xPct = t.x ?? 10;
                      const yPct = t.y ?? 10;
                      return (
                        <div
                          key={t.id}
                          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                          style={{ left: `${xPct}%`, top: `${yPct}%` }}
                        >
                          <FloorPlanTable table={t} />
                        </div>
                      );
                    }
                    // Merged group — position at the lead table's coordinates.
                    const xPct = group.x ?? 10;
                    const yPct = group.y ?? 10;
                    return (
                      <div
                        key={group.mergeId}
                        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                        style={{ left: `${xPct}%`, top: `${yPct}%` }}
                      >
                        <MergedFloorPlanTable tables={group.tables} />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-3 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300">
              {['vacant', 'partial', 'full', 'merged', 'reserved'].map(statusKey => {
                const status = statusMeta[statusKey];
                return (
                  <span key={statusKey} className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PublicDashboard;
