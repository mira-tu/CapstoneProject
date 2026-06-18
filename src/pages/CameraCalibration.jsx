import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

const CameraCalibration = ({ tables = [], setTables, selectedTableId, setSelectedTableId }) => {
  const [points, setPoints] = useState([]);
  const safeTables = Array.isArray(tables) ? tables : [];
  const safeSelectedTableId = selectedTableId || safeTables[0]?.id || '';
  const activeTable = safeTables.find(t => t.id === safeSelectedTableId) || safeTables[0] || null;
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeTable?.coordinates) {
      setPoints(activeTable.coordinates);
    } else {
      setPoints([]);
    }
  }, [selectedTableId, tables]);

  const handleImageClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (points.length >= 4) {
      setPoints([[x, y]]);
    } else {
      setPoints([...points, [x, y]]);
    }
  };

  const handleSaveCalibration = () => {
    if (points.length < 4) {
      alert("Please map exactly 4 polygon points to calibrate table region coordinates.");
      return;
    }

    if (!setTables || !safeSelectedTableId) {
      alert('Calibration setup is missing table state.');
      return;
    }

    setTables(prev => prev.map(t => {
      if (t.id === safeSelectedTableId) {
        return { ...t, coordinates: points };
      }
      return t;
    }));
    alert(`Successfully calibrated table layout coordinates for [${safeSelectedTableId}]!`);
  };

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl">
      <AdminTopbar
        title="Camera Calibration (ROI)"
        subtitle="Draw target coordinate polygons directly over the camera feed to establish spatial zones."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
              <Camera size={14} className="text-blue-400" /> CALIBRATION REGION DRAWING GRID
            </span>
          </div>

          <div 
            ref={containerRef}
            onClick={handleImageClick}
            className="flex-1 bg-slate-950 relative min-h-[380px] flex items-center justify-center p-4 cursor-crosshair"
          >
            <svg className="absolute inset-0 w-full h-full">
              {safeTables.filter(t => t.id !== safeSelectedTableId).map(t => (
                <polygon 
                  key={t.id}
                  points={t.coordinates?.map(c => c.join(',')).join(' ')} 
                  fill="rgba(59, 130, 246, 0.05)" 
                  stroke="rgba(255, 255, 255, 0.15)" 
                  strokeWidth="1.5"
                />
              ))}

              {points.length > 0 && (
                <polygon 
                  points={points.map(c => c.join(',')).join(' ')} 
                  fill="rgba(59, 130, 246, 0.25)" 
                  stroke="#3b82f6" 
                  strokeWidth="3"
                />
              )}

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

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs uppercase font-black text-slate-500">Asset Selection</span>
              <div className="mt-2">
                <select 
                  value={safeSelectedTableId}
                  onChange={(e) => setSelectedTableId?.(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:border-blue-500 outline-none"
                >
                  {safeTables.map(t => (
                    <option key={t.id} value={t.id}>{t.id} - {t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">Region Coordinates Points</span>
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
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5"
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