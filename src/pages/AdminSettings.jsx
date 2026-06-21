import React from 'react';
import { Camera, MonitorPlay, Settings, Sliders } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

const AdminSettings = ({ tables = [] }) => {
  return (
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

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2"><Settings size={20}/> KPI Display Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Visibility Settings</h4>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">Show Total Tables</label>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">Show Available Tables</label>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">Show Partial Tables</label>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">Show Full Tables</label>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">Show Merged Tables</label>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">Show Reserved/Maintenance</label>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Alert Thresholds</h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Capacity Alert (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="50" max="100" defaultValue="85" className="flex-1" />
                <span className="text-sm text-slate-600 w-12">85%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Low Availability Alert (%)</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="50" defaultValue="20" className="flex-1" />
                <span className="text-sm text-slate-600 w-12">20%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Threshold (mins)</label>
              <input type="number" defaultValue="30" className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2"><Sliders size={20}/> Floor Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">1st Floor</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor Name</label>
                <input type="text" defaultValue="Main Dining" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                <input type="number" defaultValue="20" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">2nd Floor</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor Name</label>
                <input type="text" defaultValue="Private Dining" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                <input type="number" defaultValue="15" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;