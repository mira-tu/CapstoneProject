import React, { useState, useRef, useCallback } from 'react';
import { Camera, Save, Upload } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [floorPlan, setFloorPlan] = useState(null);
  const [floorPlanFileName, setFloorPlanFileName] = useState('');
  const [positions, setPositions] = useState({});
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const safeTables = Array.isArray(tables) ? tables : [];
  const safeSelectedId = selectedTableId || safeTables[0]?.id || '';
  const activeTable = safeTables.find(t => t.id === safeSelectedId);

  // Load saved positions
  React.useEffect(() => {
    const initial = {};
    safeTables.forEach(t => {
      if (t.x && t.y) initial[t.id] = { x: t.x, y: t.y };
    });
    setPositions(initial);
  }, [tables]);

  const handleFloorPlanUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFloorPlan(URL.createObjectURL(file));
      setFloorPlanFileName(file.name);
      toast.success('Floor plan uploaded successfully');
    }
  };

  const handleContainerClick = (e) => {
    if (!containerRef.current || !safeSelectedId) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));

    setPositions(prev => ({ ...prev, [safeSelectedId]: { x: clampedX, y: clampedY } }));

    setTables(prev => prev.map(t =>
      t.id === safeSelectedId ? { ...t, x: clampedX, y: clampedY } : t
    ));
  };

  // Drag & Drop
  const handleDragStart = (e, tableId) => {
    e.dataTransfer.setData('tableId', tableId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const tableId = e.dataTransfer.getData('tableId');
    if (!tableId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));

    setPositions(prev => ({ ...prev, [tableId]: { x: clampedX, y: clampedY } }));
    setTables(prev => prev.map(t =>
      t.id === tableId ? { ...t, x: clampedX, y: clampedY } : t
    ));
  };

  const handleSave = () => {
    toast.success('Floor plan calibration saved successfully!', {
      position: "top-center",
      autoClose: 3000,
      theme: "dark"
    });
  };

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl">
      <AdminTopbar
        title="Camera Calibration"
        subtitle="Upload floor plan and position tables visually"
      />

      {/* Main Floor Plan Area - Full Width */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative min-h-[560px] flex items-center justify-center cursor-crosshair"
      >
        {floorPlan ? (
          <>
            <img src={floorPlan} alt="Floor Plan" className="max-h-full max-w-full object-contain" />

            {/* Positioned Tables */}
            {safeTables.map(table => {
              const pos = positions[table.id];
              if (!pos) return null;

              return (
                <div
                  key={table.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, table.id)}
                  className={`absolute w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 flex items-center justify-center text-xs font-bold shadow-xl transition-all hover:scale-110 cursor-grab active:cursor-grabbing ${table.id === safeSelectedId ? 'border-blue-500 bg-blue-600' : 'border-white/70 bg-slate-800'}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {table.id}
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center">
            <Upload size={64} className="mx-auto mb-6 text-slate-600" />
            <p className="text-xl text-slate-400">No floor plan uploaded yet</p>
            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium"
            >
              Upload Floor Plan Image
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFloorPlanUpload}
          className="hidden"
        />
      </div>

      {/* Bottom Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Instructions */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-white font-semibold mb-4">How to Position Tables</h3>
          <ol className="space-y-3 text-slate-400 text-[15px]">
            <li>1. Upload your restaurant floor plan above</li>
            <li>2. Select a table from the list on the right</li>
            <li>3. Click anywhere on the floor plan to place it</li>
            <li>4. Drag the table markers to fine-tune position</li>
          </ol>
        </div>

        {/* Right - Table Selector */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h3 className="text-white font-semibold mb-4">Select Table to Position</h3>
          <select
            value={safeSelectedId}
            onChange={e => setSelectedTableId?.(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3 px-4 focus:border-blue-500 outline-none"
          >
            {safeTables.map(t => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Centered Save Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSave}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 text-lg shadow-lg min-w-[300px]"
        >
          <Save size={22} /> Save All Positions
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
    </div>
  );
};

export default CameraCalibration;