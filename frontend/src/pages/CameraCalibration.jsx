import React, { useState, useRef, useEffect } from 'react';
import { Save, Upload, RefreshCw } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminTopbar from '../layouts/AdminTopbar';

// Half-width/height (in real video pixels) of the box drawn around each
// clicked point. This is a simple stand-in for full polygon drawing —
// good enough to give the detection engine a real region per table
// without needing a 4-corner drag UI.
const REGION_HALF_SIZE_PX = 180;
const DEFAULT_FRAME_WIDTH = 3840;
const DEFAULT_FRAME_HEIGHT = 2160;

/**
 * CameraCalibration
 *
 * Lets the admin grab a frame from the uploaded detection video (see
 * System Settings) and click on each table's spot in that frame. That
 * click is saved as a real pixel-space region on the backend
 * (POST /api/tables/:id/calibration), which is what YOLOv8 detection
 * actually uses to know which pixels belong to which table.
 *
 * IMPORTANT: this calibrates against the real video frame, not an
 * unrelated floor plan diagram — the two are different pixel spaces, and
 * detection would silently never match if calibrated against the wrong one.
 *
 * @param {Array}    tables             - Current table state array.
 * @param {Function} setTables          - React state setter for tables (updates x/y for the Public Lobby map only).
 * @param {string}   selectedTableId    - Currently selected table ID.
 * @param {Function} setSelectedTableId - Setter for selectedTableId.
 */
const CameraCalibration = ({ tables = [], setTables, selectedTableId, setSelectedTableId }) => {
  const [frameUrl, setFrameUrl] = useState(null);
  const [frameDims, setFrameDims] = useState(null); // real video pixel size, e.g. {width, height}
  const [positions, setPositions] = useState({});   // table.id -> {xPct, yPct} for display only
  const [regionSizes, setRegionSizes] = useState({}); // table.id -> {widthPct, heightPct}
  const [loadingFrame, setLoadingFrame] = useState(false);
  const containerRef = useRef(null);

  const safeTables = Array.isArray(tables) ? tables : [];
  const safeSelectedId = selectedTableId || safeTables[0]?.id || '';
  const regionWidthPct = ((REGION_HALF_SIZE_PX * 2) / (frameDims?.width || DEFAULT_FRAME_WIDTH)) * 100;
  const regionHeightPct = ((REGION_HALF_SIZE_PX * 2) / (frameDims?.height || DEFAULT_FRAME_HEIGHT)) * 100;

  // Load saved positions from each table's existing x/y (percentage-based,
  // used only for rendering the marker on top of the frame preview).
  useEffect(() => {
    const initial = {};
    const initialSizes = {};
    safeTables.forEach(t => {
      if (t.x != null && t.y != null) initial[t.id] = { xPct: t.x, yPct: t.y };
      initialSizes[t.id] = {
        widthPct: t.regionWidthPct || regionWidthPct,
        heightPct: t.regionHeightPct || regionHeightPct,
      };
    });
    setPositions(initial);
    setRegionSizes(initialSizes);
  }, [tables, regionWidthPct, regionHeightPct]);

  const loadFrame = async () => {
    setLoadingFrame(true);
    try {
      const [frameRes, dimsRes] = await Promise.all([
        fetch('/api/detection/frame'),
        fetch('/api/detection/frame/dimensions'),
      ]);
      if (!frameRes.ok) throw new Error((await frameRes.json()).error || 'No video uploaded yet');

      const blob = await frameRes.blob();
      setFrameUrl(URL.createObjectURL(blob));

      if (dimsRes.ok) setFrameDims(await dimsRes.json());
    } catch (err) {
      toast.error(err.message, { position: 'top-center', autoClose: 4000, theme: 'dark' });
    } finally {
      setLoadingFrame(false);
    }
  };

  // Grab a frame automatically once a video exists, so the admin doesn't
  // have to know to click "Refresh Frame" first.
  useEffect(() => { loadFrame(); }, []);

  const saveTableRegion = async (tableId, xPct, yPct, widthPct = regionWidthPct, heightPct = regionHeightPct) => {
    if (!frameDims) {
      toast.error('Load a video frame first (see System Settings).', {
        position: 'top-center', autoClose: 4000, theme: 'dark',
      });
      return;
    }

    // Convert the click's on-screen percentage into real video pixel
    // coordinates, then draw a fixed-size box around that point — this is
    // the actual region the backend's RegionMapper will test persons against.
    const cx = Math.round((xPct / 100) * frameDims.width);
    const cy = Math.round((yPct / 100) * frameDims.height);
    const halfWidthPx = Math.round(((widthPct / 100) * frameDims.width) / 2);
    const halfHeightPx = Math.round(((heightPct / 100) * frameDims.height) / 2);
    const points = [
      [Math.max(0, cx - halfWidthPx), Math.max(0, cy - halfHeightPx)],
      [Math.min(frameDims.width, cx + halfWidthPx), Math.max(0, cy - halfHeightPx)],
      [Math.min(frameDims.width, cx + halfWidthPx), Math.min(frameDims.height, cy + halfHeightPx)],
      [Math.max(0, cx - halfWidthPx), Math.min(frameDims.height, cy + halfHeightPx)],
    ];

    try {
      const res = await fetch(`/api/tables/${tableId}/calibration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save region');
    } catch (err) {
      toast.error(err.message, { position: 'top-center', autoClose: 4000, theme: 'dark' });
    }
  };

  const handleContainerClick = (e) => {
    if (!containerRef.current || !safeSelectedId || !frameUrl) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const clampedX = Math.max(2, Math.min(98, xPct));
    const clampedY = Math.max(2, Math.min(98, yPct));

    setPositions(prev => ({ ...prev, [safeSelectedId]: { xPct: clampedX, yPct: clampedY } }));
    setRegionSizes(prev => ({
      ...prev,
      [safeSelectedId]: prev[safeSelectedId] || { widthPct: regionWidthPct, heightPct: regionHeightPct },
    }));
    setTables(prev => prev.map(t =>
      t.id === safeSelectedId ? { ...t, x: clampedX, y: clampedY } : t
    ));
    const size = regionSizes[safeSelectedId] || { widthPct: regionWidthPct, heightPct: regionHeightPct };
    saveTableRegion(safeSelectedId, clampedX, clampedY, size.widthPct, size.heightPct);
  };

  const startResize = (e, tableId) => {
    e.stopPropagation();
    e.preventDefault();
    const pos = positions[tableId];
    if (!containerRef.current || !pos) return;

    const handleMove = (moveEvent) => {
      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const pointerY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      const nextWidth = Math.max(4, Math.min(80, Math.abs(pointerX - pos.xPct) * 2));
      const nextHeight = Math.max(4, Math.min(80, Math.abs(pointerY - pos.yPct) * 2));

      setRegionSizes(prev => ({
        ...prev,
        [tableId]: { widthPct: nextWidth, heightPct: nextHeight },
      }));
    };

    const handleUp = (upEvent) => {
      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = ((upEvent.clientX - rect.left) / rect.width) * 100;
      const pointerY = ((upEvent.clientY - rect.top) / rect.height) * 100;
      const widthPct = Math.max(4, Math.min(80, Math.abs(pointerX - pos.xPct) * 2));
      const heightPct = Math.max(4, Math.min(80, Math.abs(pointerY - pos.yPct) * 2));

      setTables(prev => prev.map(t =>
        t.id === tableId ? { ...t, regionWidthPct: widthPct, regionHeightPct: heightPct } : t
      ));
      saveTableRegion(tableId, pos.xPct, pos.yPct, widthPct, heightPct);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handleSave = () => {
    toast.success('All table positions are saved as you place them.', {
      position: 'top-center', autoClose: 3000, theme: 'dark',
    });
  };

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl">
      <AdminTopbar
        title="Camera Calibration"
        subtitle="Click each table's spot on the actual detection video frame"
      />

      {/* Main Frame Area - Full Width */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative min-h-[560px] flex items-center justify-center cursor-crosshair"
      >
        {frameUrl ? (
          <>
            <img src={frameUrl} alt="Video frame" className="max-h-full max-w-full object-contain" />

            {/* Positioned Tables */}
            {safeTables.map(table => {
              const pos = positions[table.id];
              if (!pos) return null;
              const size = regionSizes[table.id] || { widthPct: regionWidthPct, heightPct: regionHeightPct };
              const isSelected = table.id === safeSelectedId;

              return (
                <div
                  key={table.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 shadow-xl transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/70 bg-slate-950/20'
                  }`}
                  style={{
                    left: `${pos.xPct}%`,
                    top: `${pos.yPct}%`,
                    width: `${size.widthPct}%`,
                    height: `${size.heightPct}%`,
                  }}
                >
                  <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-xs font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {table.id}
                  </span>
                  <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-2 ring-slate-900" />
                  {isSelected && ['-left-1.5 -top-1.5', '-right-1.5 -top-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map(positionClass => (
                    <button
                      key={positionClass}
                      type="button"
                      onPointerDown={e => startResize(e, table.id)}
                      className={`absolute h-4 w-4 rounded-sm border border-white bg-blue-500 shadow ${positionClass}`}
                      title="Resize region"
                    />
                  ))}
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center">
            <Upload size={64} className="mx-auto mb-6 text-slate-600" />
            <p className="text-xl text-slate-400">
              {loadingFrame ? 'Loading frame…' : 'No detection video uploaded yet'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Upload a sample video in System Settings first, then come back here.
            </p>
            <button
              onClick={loadFrame}
              disabled={loadingFrame}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium disabled:opacity-50"
            >
              {loadingFrame ? 'Loading…' : 'Try Loading Frame Again'}
            </button>
          </div>
        )}
      </div>

      {frameUrl && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-100">
          Each table marker saves a box-shaped occupancy region. YOLO detects persons in the video, and TABLEYE counts a person for a table when the center of that person detection is inside the table's box.
        </div>
      )}

      {/* Bottom Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Instructions */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">How to Position Tables</h3>
            <button
              onClick={loadFrame}
              disabled={loadingFrame}
              title="Refresh Frame"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingFrame ? 'animate-spin' : ''} /> Refresh Frame
            </button>
          </div>
          <ol className="space-y-3 text-slate-400 text-[15px]">
            <li>1. Upload a detection video in System Settings first</li>
            <li>2. Select a table from the list on the right</li>
            <li>3. Click that table's spot on the video frame above</li>
            <li>4. The region saves automatically — click the next table and repeat</li>
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
          <Save size={22} /> Done Positioning Tables
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
    </div>
  );
};

export default CameraCalibration;
