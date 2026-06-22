import React, { useState } from 'react';
import { Camera, MonitorPlay, Sliders, Play, Pause, Save, CheckCircle2 } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

// System Settings = detection & camera configuration page.
//
// During the prototype stage these inputs are held in local React state and
// "saved" locally (simulated). They are intentionally CONTROLLED inputs so the
// page already behaves like the real thing. When the Python (Flask/FastAPI)
// backend is ready, the only change needed is to send `settings` to the API
// inside handleSave() instead of just confirming locally.
const AdminSettings = ({ simEnabled = false, onToggleSim }) => {
  // --- Camera / detection configuration (simulated for now) -----------------
  const [settings, setSettings] = useState({
    rtspUrl: 'rtsp://192.168.1.100:554/stream1',
    fps: '15',
    confidence: 75, // shown to the user as 0.75
  });

  // Shows a short "saved" confirmation after the user saves.
  const [saved, setSaved] = useState(false);

  // Update one field of the settings object.
  const updateField = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false); // any edit clears the previous "saved" confirmation
  };

  // Simulated save. Later: POST `settings` to the detection backend here.
  const handleSave = () => {
    // TODO (backend stage): send `settings` to Flask/FastAPI, e.g.
    //   await fetch('/api/settings', { method: 'POST', body: JSON.stringify(settings) })
    setSaved(true);
  };

  return (
    <div className="p-8">
      <AdminTopbar
        title="System Settings"
        subtitle="Configure the camera feed and detection model used by TABLEYE."
        action={
          <button
            onClick={onToggleSim}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-sm transition ${
              simEnabled
                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {simEnabled ? <Pause size={16} /> : <Play size={16} />}
            {simEnabled ? 'Pause Simulation' : 'Start Simulation'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- Camera & Zones ------------------------------------------------ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Camera size={20} /> Camera & Feed
          </h3>

          <div className="w-full h-48 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 mb-4 relative overflow-hidden">
            <MonitorPlay size={32} />
            <span className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              RTSP Stream Preview
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RTSP Stream URL</label>
              <input
                type="text"
                value={settings.rtspUrl}
                onChange={e => updateField('rtspUrl', e.target.value)}
                placeholder="rtsp://<camera-ip>:554/stream1"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:border-blue-500 outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">
                Address of the overhead CCTV camera feed. Used by the detection engine once connected.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Processing FPS</label>
              <select
                value={settings.fps}
                onChange={e => updateField('fps', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:border-blue-500 outline-none"
              >
                <option value="10">10 FPS (Low CPU)</option>
                <option value="15">15 FPS (Recommended)</option>
                <option value="30">30 FPS (High Performance)</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Model thresholds --------------------------------------------- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Sliders size={20} /> Detection Model
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confidence Trigger: {(settings.confidence / 100).toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.confidence}
                onChange={e => updateField('confidence', Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-400">
                Minimum confidence a YOLOv8 person detection needs before it counts toward a table.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Save bar -------------------------------------------------------- */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Save size={16} /> Save Settings
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <CheckCircle2 size={16} /> Settings saved
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
