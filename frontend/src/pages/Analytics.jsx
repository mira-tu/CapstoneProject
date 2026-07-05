import React, { useMemo, useState } from 'react';
import { Activity, BarChart3, Grid3X3 } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

/**
 * Analytics
 *
 * Displays the historical occupancy log as a filterable table alongside 
 * computed peak-hour metrics and table usage heatmaps derived directly from event logs.
 *
 * @param {Array} logs - Array of log entries from useOccupancyLog.
 */
const Analytics = ({ logs = [] }) => {
  const [filter, setFilter] = useState('');

  // 1. Process logs to build peak hours distribution (hourly transaction intensity)
  const peakHoursData = useMemo(() => {
    const hourlyCounts = Array(24).fill(0);
    logs.forEach(entry => {
      if (!entry.time) return;
      // Parses standard timestamp formats or ISO strings to extract the hour digit
      const matches = entry.time.match(/(\d{1,2}):\d{2}/);
      if (matches) {
        let hour = parseInt(matches[1], 10);
        // Quick adjustment if logs leverage 12-hour AM/PM formats
        if (entry.time.toLowerCase().includes('pm') && hour < 12) hour += 12;
        if (entry.time.toLowerCase().includes('am') && hour === 12) hour = 0;
        if (hour >= 0 && hour < 24) {
          hourlyCounts[hour]++;
        }
      }
    });

    const maxCount = Math.max(...hourlyCounts, 1);
    // Focus specifically on typical dining operation windows (e.g., 10 AM to 10 PM)
    return hourlyCounts.map((count, hour) => ({
      hour: `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? 'PM' : 'AM'}`,
      count,
      percentage: (count / maxCount) * 100,
    })).filter((_, idx) => idx >= 10 && idx <= 22);
  }, [logs]);

  // 2. Process logs to build real-time table heatmap indices
  const heatmapData = useMemo(() => {
    const tableActivity = {};
    logs.forEach(entry => {
      if (!entry.table) return;
      tableActivity[entry.table] = (tableActivity[entry.table] || 0) + 1;
    });

    const maxActivity = Math.max(...Object.values(tableActivity), 1);
    return Object.entries(tableActivity).map(([tableId, count]) => {
      let intensity = 'bg-slate-50 text-slate-400'; // No interaction
      const ratio = count / maxActivity;
      if (ratio > 0 && ratio <= 0.3) intensity = 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium';
      else if (ratio > 0.3 && ratio <= 0.7) intensity = 'bg-amber-50 border-amber-200 text-amber-700 font-medium';
      else if (ratio > 0.7) intensity = 'bg-rose-50 border-rose-200 text-rose-700 font-bold';

      return { tableId, count, intensity };
    }).sort((a, b) => a.tableId.localeCompare(b.tableId, undefined, { numeric: true }));
  }, [logs]);

  // 3. Keep original text filtration logic intact
  const filteredEvents = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return logs;

    return logs.filter(entry =>
      (entry.time || '').toLowerCase().includes(query) ||
      (entry.table || '').toLowerCase().includes(query) ||
      (entry.previous || '').toLowerCase().includes(query) ||
      (entry.current || '').toLowerCase().includes(query) ||
      (entry.source || '').toLowerCase().includes(query)
    );
  }, [filter, logs]);

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl">
      <AdminTopbar
        title="Occupancy Analytics & Logs"
        subtitle="Review real-time system heatmaps, peak-hour usage distributions, and historic records."
      />

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Peak-Hours Chart Card */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <BarChart3 size={18} className="text-blue-600" />
            <h4 className="font-semibold text-slate-800 text-sm">Peak-Hour Transaction Patterns</h4>
          </div>
          <div className="flex items-end justify-between h-36 pt-4 px-2 gap-1.5">
            {peakHoursData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 h-full group relative justify-end">
                {/* Micro Tooltip */}
                <div className="absolute -top-6 hidden group-hover:block bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10">
                  {data.count} updates
                </div>
                <div
                  style={{ height: `${Math.max(data.percentage, 4)}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${data.percentage > 75 ? 'bg-rose-500 group-hover:bg-rose-600' : 'bg-blue-500 group-hover:bg-blue-600'
                    }`}
                />
                <span className="text-[9px] text-slate-400 rotate-45 mt-4 origin-left font-medium tracking-tight whitespace-nowrap">
                  {data.hour}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-4 text-[11px] text-slate-400 italic">
            * Bars reflect frequency of table status alterations processed by the model per operational hour block.
          </div>
        </div>

        {/* Heatmap Layout Card */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Grid3X3 size={18} className="text-purple-600" />
            <h4 className="font-semibold text-slate-800 text-sm">Table Location Activity Matrix</h4>
          </div>

          {heatmapData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-slate-400 text-xs italic">
              Awaiting system traffic to map venue density trends...
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-40 overflow-y-auto p-1">
              {heatmapData.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded-xl text-center text-xs transition-shadow hover:shadow-xs flex flex-col justify-center items-center ${item.intensity}`}
                >
                  <span className="opacity-80 block font-semibold text-[10px]">T-{item.tableId.replace(/\D/g, '') || item.tableId}</span>
                  <span className="text-[10px] opacity-60 font-normal">{item.count}x updates</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-50">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Light Use</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Moderate Use</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span> High Density</span>
          </div>
        </div>

      </div>

      {/* Historical Logs Data Grid Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-slate-600" />
            <h3 className="font-semibold text-slate-700 text-sm">Historical Occupancy Log Table</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 hidden sm:block">
              Date: <span className="font-medium text-slate-700">{new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>

            <input
              type="text"
              placeholder="Filter logs... (time, table, status...)"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
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
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                    No status changes recorded yet. Changes will appear here as the detection feed updates table occupancy.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((entry, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-500">{entry.time ? entry.time : '—'}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">{entry.table}</td>
                    <td className="px-6 py-3.5 text-slate-400">{entry.previous}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${entry.current === 'Occupied' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          entry.current === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                        {entry.current}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 italic text-[11px]">{entry.source}</td>
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