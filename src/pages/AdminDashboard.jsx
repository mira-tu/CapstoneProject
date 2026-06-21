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

const AdminDashboard = ({ tables }) => {
  const vacant = tables.filter(t => t.status === 'vacant').length;
  const partial = tables.filter(t => t.status === 'partial').length;
  const full = tables.filter(t => t.status === 'full').length;
  const merged = tables.filter(t => t.status === 'merged').length;
  const reserved = tables.filter(t => t.status === 'reserved').length;
  const maintenance = tables.filter(t => t.status === 'maintenance').length;

  const floor1Tables = tables.filter(t => t.floor === 1 || !t.floor);
  const floor2Tables = tables.filter(t => t.floor === 2);
  const mockFloor2Tables = [
    { id: 'M21', label: 'Mock Table 1', status: 'vacant', capacity: 4, occupied: 0, conf: 100, auto: true, floor: 2 },
    { id: 'M22', label: 'Mock Table 2', status: 'partial', capacity: 4, occupied: 2, conf: 88, auto: true, floor: 2 },
    { id: 'M23', label: 'Mock Table 3', status: 'full', capacity: 4, occupied: 4, conf: 94, auto: true, floor: 2 },
    { id: 'M24', label: 'Mock Table 4', status: 'maintenance', capacity: 4, occupied: 0, conf: null, auto: false, floor: 2 },
  ];
  const displayedFloor2Tables = floor2Tables.length > 0 ? floor2Tables : mockFloor2Tables;

  return (
    <div className="p-8">
      <AdminTopbar
        title="Live Occupancy Monitoring"
        subtitle="Real-time floor plan updates powered by YOLOv8."
        action={
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
            </span>
            YOLOv8 Inference Active (15 FPS)
          </div>
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
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">1st Floor</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {floor1Tables.map(table => (
                <TableCard key={table.id} table={table} isAdmin={true} />
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">2nd Floor</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedFloor2Tables.map(table => (
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