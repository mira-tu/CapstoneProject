import React from 'react';
import { LayoutDashboard, CheckCircle2, Users, AlertTriangle } from 'lucide-react';
import TableCard from '../components/TableCard';
import AdminTopbar from '../layouts/AdminTopbar';

const KpiCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
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
  const full = tables.filter(t => t.status === 'full').length;
  const partial = tables.filter(t => t.status === 'partial').length;

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total Tables" value={tables.length} icon={<LayoutDashboard />} color="blue" />
        <KpiCard title="Available Tables" value={vacant} icon={<CheckCircle2 />} color="green" />
        <KpiCard title="Partially Filled" value={partial} icon={<Users />} color="yellow" />
        <KpiCard title="Fully Occupied" value={full} icon={<AlertTriangle />} color="red" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-6 border-b pb-2">Main Dining Area Floor Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map(table => (
            <TableCard key={table.id} table={table} isAdmin={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;