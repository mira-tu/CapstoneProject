import { useEffect, useState } from 'react';
import { Lock, MapPin } from 'lucide-react';
import tableyeLogo from '../assets/tableye-logo.png';
import FloorPlanTable, { MergedFloorPlanTable } from '../components/table/FloorPlanTable';
import AnnotatedVideoFeed from '../components/detection/AnnotatedVideoFeed';
import { STATUS_META } from '../constants/tableStatus';
import { DEFAULT_CMS_CONFIG } from '../constants/cmsConfig';

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
 * If there is more than one floor, users can switch floors manually by
 * clicking the floor dots. It no longer auto-rotates on its own.
 *
 * @param {Array}    tables       - Current table state array.
 * @param {Function} onViewChange - Callback to navigate to the admin view.
 * @param {object}   cmsConfig    - Branding/appearance/visibility config from the admin CMS editor.
 */
const PublicDashboard = ({ tables, onViewChange, cmsConfig }) => {
  const cms = { ...DEFAULT_CMS_CONFIG, ...cmsConfig };
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [detectionRunning, setDetectionRunning] = useState(false);

  // Check if detection is running
  useEffect(() => {
    let cancelled = false;
    const checkDetection = async () => {
      try {
        const res = await fetch('/api/detection/status');
        const data = await res.json();
        if (!cancelled) setDetectionRunning(data.running || false);
      } catch {
        if (!cancelled) setDetectionRunning(false);
      }
    };
    
    checkDetection();
    const interval = setInterval(checkDetection, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Build per-floor slide data, filtering out empty floors.
  const floorSlides = [
    { number: 1, label: 'Dining Area', tables: tables.filter(t => t.floor === 1 || !t.floor) },
    { number: 2, label: '2nd Floor', tables: tables.filter(t => t.floor === 2) },
  ].filter(floor => floor.tables.length > 0);

  const activeFloor = floorSlides[activeFloorIndex] || floorSlides[0];
  const activeAccess = FLOOR_ACCESS[activeFloor?.number] || FLOOR_ACCESS[1];
  const floorVacant = activeFloor?.tables.filter(t => t.status === 'vacant').length || 0;
  const floorPartial = activeFloor?.tables.filter(t => t.status === 'partial').length || 0;
  const floorFull = activeFloor?.tables.filter(t => t.status === 'full').length || 0;

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{
        backgroundColor: cms.backgroundColor,
        color: cms.textColor,
        ...(cms.backgroundImage && {
          backgroundImage: `url(${cms.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }),
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="grid grid-cols-[auto_1fr_auto] items-center border-b border-slate-800 px-4 py-3"
        style={{ backgroundColor: cms.sidebarColor }}
      >
        <img
          src={cms.logo || tableyeLogo}
          alt={`${cms.brandName} Logo`}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-700"
        />
        <div className="text-center">
          <h2 className="mt-1 text-3xl font-bold tracking-[0.35em]" style={{ color: cms.textColor }}>{cms.brandName}</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">{cms.welcomeMessage}</p>
        </div>
        <button
          onClick={() => onViewChange('dashboard')}
          className="ml-auto flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-slate-100 shadow-sm transition hover:bg-slate-700"
          title="Admin View"
        >
          <Lock size={18} />
        </button>
      </header>

      {/* ── Detection Video Section (PRIMARY) ─────────────────────────────── */}
      {cms.showLiveVideoPublicly && (
        <section className="grid min-h-0 flex-1 gap-4 overflow-hidden px-4 py-4 lg:grid-cols-[minmax(0,2fr)_minmax(360px,0.85fr)]">
          <div className="flex min-h-0 flex-col gap-3">
            <div className="relative min-h-0 flex-1 rounded-2xl border border-slate-700 bg-slate-900 shadow-lg overflow-hidden">
              <AnnotatedVideoFeed isRunning={detectionRunning} />
            </div>
            {cms.showOccupancyStats && activeFloor && (
              <div className="grid shrink-0 gap-3 md:grid-cols-3">
                <StatTile label="Available" value={floorVacant} colorClass="border-green-500/30 bg-green-500/10" textClass="text-green-400" />
                <StatTile label="Partial" value={floorPartial} colorClass="border-yellow-500/30 bg-yellow-500/10" textClass="text-yellow-300" />
                <StatTile label="Full" value={floorFull} colorClass="border-red-500/30 bg-red-500/10" textClass="text-white" />
              </div>
            )}
          </div>
          <CustomerStatusPanel cms={cms} />
        </section>
      )}

      {/* ── Quick Occupancy Summary (STATS) ────────────────────────────────── */}
      {!cms.showLiveVideoPublicly && cms.showOccupancyStats && activeFloor && (
        <div className="grid gap-3 px-4 py-3 md:grid-cols-4">
          <StatTile label="Total Tables" value={activeFloor.tables.length} colorClass="border-slate-700 bg-slate-800/80" textClass="text-white" />
          <StatTile label="Available" value={floorVacant} colorClass="border-green-500/30 bg-green-500/10" textClass="text-green-400" />
          <StatTile label="Partial" value={floorPartial} colorClass="border-yellow-500/30 bg-yellow-500/10" textClass="text-yellow-300" />
          <StatTile label="Full" value={floorFull} colorClass="border-red-500/30 bg-red-500/10" textClass="text-white" />
        </div>
      )}

      {/* ── Floor Plan Section (SECONDARY) ───────────────────────────────── */}
      {!cms.showLiveVideoPublicly && cms.showTableList && activeFloor && (
        <section className="flex-1 min-h-0 overflow-auto px-4 py-3 md:py-4 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
          {/* Floor selector dots (shown only if multiple floors exist) */}
          {floorSlides.length > 1 && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 mb-3">
              {floorSlides.map((floor, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFloorIndex(index)}
                  title={floor.label}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    index === activeFloorIndex
                      ? 'bg-blue-400 ring-2 ring-blue-300'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Floor plan canvas container */}
          <div className="relative min-h-0 flex-1 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 overflow-auto">
            {/* Map header + entrance label */}
            <div className="mb-3 flex items-center gap-3">
              <MapPin size={18} className="text-blue-300" />
              <h3 className="text-lg font-black uppercase tracking-[0.22em] text-slate-200">{activeFloor.label} Facility Map</h3>
              <div className="h-px flex-1 bg-slate-800" />
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{activeAccess.access}</p>
            </div>

            {/* Entrance strip */}
            <div className="absolute top-16 left-0 right-0 mx-4 flex h-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200 z-10">
              <span className="absolute left-4 text-slate-300">{activeAccess.access}</span>
              {activeAccess.entrance}
            </div>

            {/* Floor plan canvas with table tiles */}
            <div
              className="relative w-full h-96 rounded-2xl border border-slate-800 bg-slate-950 bg-[linear-gradient(90deg,rgba(51,65,85,0.18)_1px,transparent_1px),linear-gradient(rgba(51,65,85,0.18)_1px,transparent_1px)] bg-[size:42px_42px]"
              style={cms.floorPlanImage ? {
                backgroundImage: `linear-gradient(rgba(2,6,23,0.12), rgba(2,6,23,0.12)), url(${cms.floorPlanImage})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              } : undefined}
            >
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

      <footer className="py-3 text-center text-[11px] font-medium tracking-wide text-slate-500">
        {cms.footerText}
      </footer>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const CustomerStatusPanel = ({ cms }) => {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-lg">
      {cms.floorPlanImage && (
        <div
          className="min-h-0 flex-1 rounded-xl border border-slate-700 bg-slate-950"
          style={{
            backgroundImage: `url(${cms.floorPlanImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      )}
      {!cms.floorPlanImage && (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 text-center text-sm font-semibold text-slate-500">
          Upload a floor plan in CMS
        </div>
      )}
    </aside>
  );
};

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
