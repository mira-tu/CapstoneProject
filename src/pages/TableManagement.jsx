import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

const TableManagement = ({ tables, onAdd, onDelete }) => {
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newId || !newLabel) return;
    onAdd({
      id: newId.toUpperCase(),
      label: newLabel,
      status: 'vacant',
      capacity: parseInt(newCapacity),
      occupied: 0,
      conf: 100,
      auto: true,
      coordinates: [[100, 100], [200, 100], [200, 200], [100, 200]]
    });
    setNewId('');
    setNewLabel('');
  };

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl">
      <AdminTopbar
        title="Table Asset Management (CRUD)"
        subtitle="Perform standard inventory modifications directly to SQL."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus size={20}/> Create Asset</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Table ID</label>
              <input type="text" placeholder="T05" value={newId} onChange={e => setNewId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Label</label>
              <input type="text" placeholder="Corner Booth" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white">Add Asset</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950">
            <span className="text-xs font-bold text-slate-400">REGISTERED PHYSICAL INVENTORY</span>
          </div>
          <div className="divide-y divide-slate-800 bg-slate-950">
            {tables.map(table => (
              <div key={table.id} className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-white">{table.id} - {table.label}</h4>
                  <p className="text-xs text-slate-500">Capacity: {table.capacity} Chairs</p>
                </div>
                <button onClick={() => onDelete(table.id)} className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableManagement;