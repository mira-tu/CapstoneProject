import React from 'react';
import { LayoutDashboard, CheckCircle2, Users, Grid2x2, AlertTriangle, CombineIcon } from 'lucide-react';
import TableCard from '../components/TableCard';
import AdminTopbar from '../layouts/AdminTopbar';

const KpiCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    gray: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className={`p-4 rounded-lg ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

const AdminDashboard = ({ tables, simEnabled = false, onToggleSim }) => {
  const vacant = tables.filter(t => t.status === 'vacant').length;
  const partial = tables.filter(t => t.status === 'partial').length;
  const full = tables.filter(t => t.status === 'full').length;
  const merged = tables.filter(t => t.status === 'merged').length;
  const reserved = tables.filter(t => t.status === 'reserved').length;
  const maintenance = tables.filter(t => t.status === 'maintenance').length;

  const floor1Tables = tables.filter(t => t.floor === 1 || !t.floor);

  return (
    <div className="p-8">
      <AdminTopbar
        title="Live Occupancy Monitoring"
        subtitle="Real-time floor plan updates powered by YOLOv8."
        action={
          <button
            onClick={onToggleSim}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-sm transition ${
              simEnabled
                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={simEnabled ? 'Pause simulated detection feed' : 'Start simulated detection feed'}
          >
            <span className="relative flex h-3 w-3">
              {simEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${simEnabled ? 'bg-green-600' : 'bg-slate-400'}`}></span>
            </span>
            {simEnabled ? 'YOLOv8 Inference Active (Simulated)' : 'Detection Paused'}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-8">
        <KpiCard title="Total Tables" value={tables.length} icon={<LayoutDashboard />} color="blue" />
        <KpiCard title="Available" value={vacant} icon={<CheckCircle2 />} color="green" />
        <KpiCard title="Partial" value={partial} icon={<Users />} color="yellow" />
        <KpiCard title="Full" value={full} icon={<Grid2x2 />} color="red" />
        <KpiCard title="Merged" value={merged} icon={<CombineIcon />} color="orange" />
        <KpiCard title="Reserved / Maintenance" value={reserved + maintenance} icon={<AlertTriangle />} color="gray" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-6 border-b pb-2">Main Dining Area Floor Plan</h3>

        <div className="space-y-8">
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {floor1Tables.map(table => (
                <TableCard key={table.id} table={table} isAdmin={true} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;