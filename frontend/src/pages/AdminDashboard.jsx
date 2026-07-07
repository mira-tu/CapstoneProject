import React, { useEffect, useState } from 'react';
import { LayoutDashboard, CheckCircle2, Users, Grid2x2, AlertTriangle, CombineIcon } from 'lucide-react';
import TableCard from '../components/table/TableCard';
import AnnotatedVideoFeed from '../components/detection/AnnotatedVideoFeed';
import AdminTopbar from '../layouts/AdminTopbar';

/**
 * KpiCard
 * A single stat tile shown in the summary row at the top of the dashboard.
 */
const KpiCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    gray: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className={`p-4 rounded-lg ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

/**
 * AdminDashboard
 *
 * Live occupancy dashboard with integrated annotated video feed.
 * Left side: Live camera feed with detection boxes, person counts, table status
 * Right side: KPI metrics and occupancy summary
 * Bottom: Table grid showing all current table statuses
 *
 * @param {Array}    tables          - Current table state array.
 * @param {boolean}  simEnabled      - Whether the detection feed polling is active.
 * @param {Function} onToggleSim     - Callback to pause / resume polling.
 * @param {object}   detectionStatus - { running, error } from the real backend detection engine.
 */
const AdminDashboard = ({ tables, simEnabled = false, onToggleSim, detectionStatus }) => {
  const engineRunning = simEnabled && detectionStatus?.running;
  const engineError = detectionStatus?.error;
  const [liveVideoUrl, setLiveVideoUrl] = useState(null);

  // Fetch the currently-uploaded video URL
  useEffect(() => {
    let cancelled = false;
    fetch('/api/detection/settings')
      .then(res => res.json())
      .then(data => { if (!cancelled) setLiveVideoUrl(data.videoUrl || null); })
      .catch(() => { if (!cancelled) setLiveVideoUrl(null); });
    return () => { cancelled = true; };
  }, []);

  const vacant = tables.filter(t => t.status === 'vacant').length;
  const partial = tables.filter(t => t.status === 'partial').length;
  const full = tables.filter(t => t.status === 'full').length;
  const merged = tables.filter(t => t.status === 'merged').length;
  const reserved = tables.filter(t => t.status === 'reserved').length;
  const maintenance = tables.filter(t => t.status === 'maintenance').length;

  const floor1Tables = tables.filter(t => t.floor === 1 || !t.floor);

  return (
    <div className="flex flex-col h-full p-8 gap-6 bg-slate-50">
      <AdminTopbar
        title="Live Occupancy Dashboard"
        subtitle="Real-time monitoring with live camera detection and YOLOv8 analysis."
        action={
          <button
            onClick={onToggleSim}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-sm transition
              ${engineRunning
                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
            title={simEnabled ? 'Pause detection feed polling' : 'Start detection feed polling'}
          >
            <span className="relative flex h-3 w-3">
              {engineRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${engineRunning ? 'bg-green-600' : 'bg-slate-400'}`} />
            </span>
            {engineRunning ? 'Detection Active' : simEnabled ? 'Waiting for Engine' : 'Detection Paused'}
          </button>
        }
      />

      {engineError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Detection engine error: {engineError}
        </div>
      )}

      {/* Main content: Annotated video feed + KPIs side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* LEFT: Annotated Detection Feed */}
        <div className="lg:col-span-2 min-h-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="bg-slate-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Live Detection Feed</h3>
              {engineRunning && (
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-red-300 uppercase tracking-[0.1em]">Live</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 bg-slate-900 flex items-center justify-center relative overflow-hidden">
              <AnnotatedVideoFeed isRunning={engineRunning} />
            </div>
          </div>
        </div>

        {/* RIGHT: KPI Cards */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.15em]">Total Tables</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{tables.length}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.1em]">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{vacant}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.1em]">Partial</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{partial}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.1em]">Full</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{full}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.1em]">Merged</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{merged}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-[0.1em]">Reserved / Maint.</p>
            <p className="text-3xl font-bold text-slate-600 mt-1">{reserved + maintenance}</p>
          </div>
        </div>
      </div>

      {/* BOTTOM: Table Grid */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-6 border-b pb-2">Table Status Grid</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {floor1Tables.map(table => (
            <TableCard key={table.id} table={table} isAdmin />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
