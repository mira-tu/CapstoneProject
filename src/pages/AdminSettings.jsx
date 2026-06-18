import React from 'react';
import { Camera, MonitorPlay } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

const AdminSettings = () => (
  <div className="p-8">
    <AdminTopbar
      title="System Settings"
      subtitle="Configure hardware inputs and model thresholds."
    />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2"><Camera size={20}/> Camera & Zones</h3>
        
        <div className="w-full h-48 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 mb-4 relative overflow-hidden">
          <MonitorPlay size={32} className="mb-2" />
          <span className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">RTSP Stream Preview</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">RTSP Stream URL</label>
            <input type="text" defaultValue="rtsp://192.168.1.100:554/stream1" className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Processing FPS</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50">
              <option>10 FPS (Low CPU)</option>
              <option selected>15 FPS (Recommended)</option>
              <option>30 FPS (High Performance)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Model Thresholds</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confidence Trigger: 0.75</label>
              <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-orange-500">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 text-orange-600">Manual Status Overrides</h3>
          <div className="flex gap-4 mb-4">
             <select className="px-3 py-2 border rounded-lg text-sm bg-slate-50 flex-1">
              <option>Select Table...</option>
              <option>Table 01</option>
            </select>
            <select className="px-3 py-2 border rounded-lg text-sm bg-slate-50 flex-1">
              <option>Mark as Maintenance</option>
              <option>Restore Automation</option>
            </select>
          </div>
          <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded-lg text-sm">Apply Override</button>
        </div>
      </div>
    </div>
  </div>
);

export default AdminSettings;