import React, { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

/**
 * Analytics
 *
 * Displays the historical occupancy log as a filterable table.
 * Log entries are written only on status change events (per project spec).
 *
 * @param {Array} logs - Array of log entries from useOccupancyLog.
 */
const Analytics = ({ logs = [] }) => {
  const [filter, setFilter] = useState('');

const filteredEvents = useMemo(() => {
  const query = filter.trim().toLowerCase();
  if (!query) return logs;

  return logs.filter(entry => 
    (entry.time     || '').toLowerCase().includes(query) ||
    (entry.table    || '').toLowerCase().includes(query) ||
    (entry.previous || '').toLowerCase().includes(query) ||
    (entry.current  || '').toLowerCase().includes(query) ||
    (entry.source   || '').toLowerCase().includes(query)
  );
}, [filter, logs]);

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl">
      <AdminTopbar
        title="Occupancy Logs"
        subtitle="Review timestamped table status changes recorded by the system."
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-slate-600" />
            <h3 className="font-semibold text-slate-700">Historical Occupancy Report</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500">
              Today: <span className="font-medium text-slate-700">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            
            <input
              type="text"
              placeholder="Filter logs... (time, table, status...)"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 w-72"
            />
          </div>
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Table ID</th>
                <th className="px-6 py-3 font-medium">Previous Status</th>
                <th className="px-6 py-3 font-medium">Current Status</th>
                <th className="px-6 py-3 font-medium">Trigger Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    No status changes recorded yet. Changes will appear here as the detection feed updates table occupancy.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-slate-500">{entry.time ? entry.time : '—'}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{entry.table}</td>
                    <td className="px-6 py-4 text-slate-500">{entry.previous}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{entry.current}</td>
                    <td className="px-6 py-4 text-slate-500">{entry.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
