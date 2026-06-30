import React, { useEffect, useState } from 'react';
import { Lock, MapPin } from 'lucide-react';
import tableyeLogo from '../assets/tableye-logo.png';
import FloorPlanTable, { MergedFloorPlanTable } from '../components/table/FloorPlanTable';
import { STATUS_META } from '../constants/tableStatus';

// Floor access point labels shown on the map header.
const FLOOR_ACCESS = {
  1: { entrance: 'Cashier', access: 'Upstairs' },
  2: { entrance: '', access: 'Downstairs' },
};

/**
 * PublicDashboard
 *
 * Customer-facing entrance display showing a realistic top-down floor plan
 * with color-coded table and chair icons per status.
 * Auto-rotates between floors every 5 seconds if there is more than one.
 *
 * @param {Array}    tables       - Current table state array.
 * @param {Function} onViewChange - Callback to navigate to the admin view.
 */
const PublicDashboard = ({ tables, onViewChange }) => {
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  // Build per-floor slide data, filtering out empty floors.
  const floorSlides = [
    { number: 1, label: 'Dining Area', tables: tables.filter(t => t.floor === 1 || !t.floor) },
    { number: 2, label: '2nd Floor', tables: tables.filter(t => t.floor === 2) },
  ].filter(floor => floor.tables.length > 0);

  const activeFloor = floorSlides[activeFloorIndex] || floorSlides[0];
  const activeAccess = FLOOR_ACCESS[activeFloor?.number] || FLOOR_ACCESS[1];
  const floorVacant = activeFloor?.tables.filter(t => t.status === 'vacant').length || 0;
  const floorFull = activeFloor?.tables.filter(t => t.status === 'full').length || 0;

  // Auto-rotate floors.
  useEffect(() => {
    if (floorSlides.length <= 1) return undefined;
    const timer = window.setInterval(
      () => setActiveFloorIndex(i => (i + 1) % floorSlides.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [floorSlides.length]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="grid grid-cols-[auto_1fr_auto] items-center border-b border-slate-800 bg-slate-950 px-4 py-3">
        <img src={tableyeLogo} alt="Tableye Logo" className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-700" />
        <div className="text-center">
          <h2 className="mt-1 text-3xl font-bold tracking-[0.35em] text-white">TABLEYE</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Live Occupancy Dashboard</p>
        </div>
        <button
          onClick={() => onViewChange('dashboard')}
          className="ml-auto flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-slate-100 shadow-sm transition hover:bg-slate-700"
          title="Admin View"
        >
          <Lock size={18} />
        </button>
      </header>

      {/* ── Floor plan ─────────────────────────────────────────── */}
      <main className="flex min-h-0 flex-1 flex-col items-center p-4">
        {activeFloor && (
          <section className="flex min-h-0 w-full max-w-7xl flex-1 flex-col rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            {/* Stats row */}
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="grid gap-3 md:grid-cols-3">
                <StatTile label="Area" value={activeFloor.label} colorClass="border-slate-700 bg-slate-800/80" textClass="text-white" />
                <StatTile label="Available" value={`${floorVacant} / ${activeFloor.tables.length}`} colorClass="border-green-500/30 bg-green-500/10" textClass="text-green-400" />
                <StatTile label="Full" value={`${floorFull} Table/s`} colorClass="border-red-500/30 bg-red-500/10" textClass="text-white" />
              </div>
              {floorSlides.length > 1 && (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4">
                  {floorSlides.map((_, index) => (
                    <span
                      key={index}
                      className={`h-3 w-3 rounded-full ${index === activeFloorIndex ? 'bg-blue-400' : 'bg-slate-700'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Canvas */}
            <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center gap-3">
                <MapPin size={18} className="text-blue-300" />
                <h3 className="text-lg font-black uppercase tracking-[0.22em] text-slate-200">{activeFloor.label} Facility Map</h3>
                <div className="h-px flex-1 bg-slate-800" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{activeAccess.access}</p>
              </div>

              <div className="relative min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-800 bg-[linear-gradient(90deg,rgba(51,65,85,0.18)_1px,transparent_1px),linear-gradient(rgba(51,65,85,0.18)_1px,transparent_1px)] bg-[size:42px_42px]">
                {/* Entrance strip */}
                <div className="absolute top-2 left-0 right-0 mx-4 flex h-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200 z-10">
                  <span className="absolute left-4 text-slate-300">{activeAccess.access}</span>
                  {activeAccess.entrance}
                </div>

                {/* Table tiles */}
                <FloorPlanCanvas tables={activeFloor.tables} />
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-3 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300">
              {['vacant', 'partial', 'full', 'merged', 'reserved'].map(key => (
                <span key={key} className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${STATUS_META[key].dot}`} />
                  {STATUS_META[key].label}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>


    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatTile = ({ label, value, colorClass, textClass }) => (
  <div className={`rounded-2xl border p-4 text-center ${colorClass}`}>
    <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${textClass} opacity-70`}>{label}</p>
    <p className={`mt-1 text-3xl font-black ${textClass}`}>{value}</p>
  </div>
);

/**
 * FloorPlanCanvas
 * Renders absolutely-positioned table tiles, grouping merged tables together.
 */
const FloorPlanCanvas = ({ tables }) => {
  // Separate single tables from merged groups.
  const groups = [];
  const mergeGroups = {};

  tables.forEach(table => {
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
};

export default PublicDashboard;
