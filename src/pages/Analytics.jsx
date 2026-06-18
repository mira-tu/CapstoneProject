import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

const recentEvents = [
  { time: 'Today, 12:45 PM', table: 'T02', event: 'Vacant → Full', source: 'YOLOv8 Auto' },
  { time: 'Today, 11:20 AM', table: 'T04', event: 'Partial → Vacant', source: 'Manual Override' },
  { time: 'Today, 10:05 AM', table: 'T01', event: 'Vacant → Partial', source: 'Sensor Update' },
  { time: 'Yesterday, 08:30 PM', table: 'T03', event: 'Maintenance → Vacant', source: 'Admin Action' },
];

const Analytics = () => (
  <div className="p-8 space-y-8 w-full max-w-7xl">
    <AdminTopbar
      title="Analytics & Activity"
      subtitle="Track occupancy performance and recent system events in one place."
    />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">Peak Occupancy</p>
        <h3 className="mt-2 text-3xl font-black text-white">78%</h3>
        <p className="mt-2 text-sm text-slate-400">Highest usage between 12:00–1:00 PM</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">Avg. Turnaround</p>
        <h3 className="mt-2 text-3xl font-black text-white">41 min</h3>
        <p className="mt-2 text-sm text-slate-400">Across all active tables</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">Optimization Index</p>
        <h3 className="mt-2 text-3xl font-black text-blue-500">84.2%</h3>
        <p className="mt-2 text-sm text-slate-400">Up 12% from last week</p>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Occupancy Trend</h3>
          <span className="text-xs text-slate-500">Last 7 days</span>
        </div>
        <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 flex items-end gap-3 px-4 py-6">
          <div className="flex-1 bg-slate-200 h-[35%] rounded-t-md"></div>
          <div className="flex-1 bg-blue-500 h-[58%] rounded-t-md"></div>
          <div className="flex-1 bg-blue-600 h-[72%] rounded-t-md"></div>
          <div className="flex-1 bg-slate-300 h-[48%] rounded-t-md"></div>
          <div className="flex-1 bg-blue-500 h-[82%] rounded-t-md"></div>
          <div className="flex-1 bg-blue-600 h-[90%] rounded-t-md"></div>
          <div className="flex-1 bg-slate-200 h-[40%] rounded-t-md"></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Efficiency</h3>
          <TrendingUp size={16} className="text-emerald-500" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Table 01</span><span>32 mins</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[50%]"></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Table 02</span><span>55 mins</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="h-full bg-rose-500 w-[85%]"></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Table 04</span><span>27 mins</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[42%]"></div></div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-slate-600" />
          <h3 className="font-semibold text-slate-700">Recent Status Changes</h3>
        </div>
        <input
          type="text"
          placeholder="Filter events..."
          className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Table ID</th>
              <th className="px-6 py-3 font-medium">Event</th>
              <th className="px-6 py-3 font-medium">Trigger Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {recentEvents.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-slate-500">{entry.time}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{entry.table}</td>
                <td className="px-6 py-4"><span className="text-red-600">{entry.event}</span></td>
                <td className="px-6 py-4 text-slate-500">{entry.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Analytics;