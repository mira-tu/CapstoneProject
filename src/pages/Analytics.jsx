import { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

const recentEvents = [
  { time: 'Today, 12:45 PM', table: 'T02', previous: 'Vacant', current: 'Full', source: 'YOLOv8 Auto' },
  { time: 'Today, 11:20 AM', table: 'T04', previous: 'Partial', current: 'Vacant', source: 'Manual Override' },
  { time: 'Today, 10:05 AM', table: 'T01', previous: 'Vacant', current: 'Partial', source: 'Sensor Update' },
  { time: 'Yesterday, 08:30 PM', table: 'T03', previous: 'Maintenance', current: 'Vacant', source: 'Admin Action' },
];

const Analytics = () => {
  const [filter, setFilter] = useState('');
  const filteredEvents = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return recentEvents;

    return recentEvents.filter(entry => (
      entry.time.toLowerCase().includes(query) ||
      entry.table.toLowerCase().includes(query) ||
      entry.previous.toLowerCase().includes(query) ||
      entry.current.toLowerCase().includes(query) ||
      entry.source.toLowerCase().includes(query)
    ));
  }, [filter]);

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl">
      <AdminTopbar
        title="Occupancy Logs"
        subtitle="Review timestamped table status changes recorded by the system."
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-slate-600" />
            <h3 className="font-semibold text-slate-700">Historical Occupancy Report</h3>
          </div>
          <input
            type="text"
            placeholder="Filter logs..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
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
              {filteredEvents.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-slate-500">{entry.time}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{entry.table}</td>
                  <td className="px-6 py-4 text-slate-500">{entry.previous}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{entry.current}</td>
                  <td className="px-6 py-4 text-slate-500">{entry.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
