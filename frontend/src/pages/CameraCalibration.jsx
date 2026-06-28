import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

/**
 * CameraCalibration
 *
 * Lets the admin draw a 4-point polygon region over the camera feed image
 * for each table. The centroid of those 4 points is saved as the table's
 * (x%, y%) position on the Public Lobby floor plan.
 *
 * When the Flask backend is ready, replace the local setTables() call in
 * handleSaveCalibration() with saveCalibration() from api/tablesApi.js.
 *
 * @param {Array}    tables             - Current table state array.
 * @param {Function} setTables          - React state setter for tables.
 * @param {string}   selectedTableId    - Currently selected table ID.
 * @param {Function} setSelectedTableId - Setter for selectedTableId.
 */
const CameraCalibration = ({ tables = [], setTables, selectedTableId, setSelectedTableId }) => {
  const [points, setPoints] = useState([]);
  const containerRef = useRef(null);

  const safeTables        = Array.isArray(tables) ? tables : [];
  const safeSelectedId    = selectedTableId || safeTables[0]?.id || '';
  const activeTable       = safeTables.find(t => t.id === safeSelectedId) || safeTables[0] || null;
  const floor1Tables      = safeTables.filter(t => t.floor === 1 || !t.floor);

  // Load existing coordinates when the selected table changes.
  useEffect(() => {
    setPoints(activeTable?.coordinates ?? []);
  }, [selectedTableId, tables]);

  const handleCanvasClick = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    // After 4 points, restart from scratch.
    setPoints(prev => (prev.length >= 4 ? [[x, y]] : [...prev, [x, y]]));
  };

  const handleSaveCalibration = () => {
    if (points.length < 4) {
      alert('Please map exactly 4 polygon points to calibrate the table region.');
      return;
    }
    if (!setTables || !safeSelectedId) {
      alert('Calibration setup is missing table state.');
      return;
    }

    // Compute the centroid of the 4 points and convert to % of container.
    const container = containerRef.current;
    const w  = container ? container.offsetWidth  : 1;
    const h  = container ? container.offsetHeight : 1;
    const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    // Clamp to 5–90% so the table tile never clips the canvas edge.
    const xPct = Math.min(90, Math.max(5, Math.round((cx / w) * 100)));
    const yPct = Math.min(90, Math.max(5, Math.round((cy / h) * 100)));

    // TODO (backend stage): replace with saveCalibration(safeSelectedId, points)
    setTables(prev => prev.map(t =>
      t.id === safeSelectedId ? { ...t, coordinates: points, x: xPct, y: yPct } : t,
    ));

    alert(`Calibrated [${safeSelectedId}] — floor plan position updated to (${xPct}%, ${yPct}%).`);
  };

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl">
      <AdminTopbar
        title="Camera Calibration (ROI)"
        subtitle="Draw 4-point polygons over the camera feed to establish table spatial zones."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Drawing canvas */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
            <Camera size={14} className="text-blue-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calibration Region Drawing Grid</span>
          </div>

          <div
            ref={containerRef}
            onClick={handleCanvasClick}
            className="flex-1 bg-slate-950 relative min-h-[380px] flex items-center justify-center p-4 cursor-crosshair"
          >
            {/* SVG overlay — pointer-events:none so clicks reach the div above */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Other tables' existing regions (faint) */}
              {safeTables
                .filter(t => t.id !== safeSelectedId)
                .map(t => (
                  <polygon
                    key={t.id}
                    points={t.coordinates?.map(c => c.join(',')).join(' ')}
                    fill="rgba(59,130,246,0.05)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                  />
                ))}

              {/* Active table region (bright blue) */}
              {points.length > 0 && (
                <polygon
                  points={points.map(c => c.join(',')).join(' ')}
                  fill="rgba(59,130,246,0.25)"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
              )}

              {/* Point markers */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt[0]} cy={pt[1]} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={pt[0] + 10} y={pt[1] - 10} fill="#ffffff" className="text-[10px] font-bold font-mono">
                    P{idx + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Controls panel */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Table selector */}
            <div className="border-b border-slate-800 pb-4 space-y-3">
              <span className="text-xs uppercase font-black text-slate-500">Asset Selection</span>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">Dining Area Tables</p>
                <select
                  value={safeSelectedId}
                  onChange={e => setSelectedTableId?.(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:border-blue-500 outline-none"
                >
                  {floor1Tables.map(t => (
                    <option key={t.id} value={t.id}>{t.id} – {t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coordinate readout */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">Region Coordinate Points</span>
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2 font-mono text-xs">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-500">
                    <span>Point {idx + 1}:</span>
                    <span className="text-white font-semibold">
                      {points[idx] ? `[${points[idx][0]}px, ${points[idx][1]}px]` : 'Unmapped'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveCalibration}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> Save Mapped Area
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCalibration;
