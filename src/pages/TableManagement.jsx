import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Eye, Save, X } from 'lucide-react';
import AdminTopbar from '../layouts/AdminTopbar';

const TableManagement = ({ tables, onAdd, onDelete, onUpdate }) => {
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [newFloor, setNewFloor] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ id: '', label: '', capacity: 4, floor: 1 });

  const floor1Tables = tables.filter(table => table.floor === 1 || !table.floor);
  const floor2Tables = tables.filter(table => table.floor === 2);
  const selectedTable = tables.find(table => table.id === selectedId) || tables[0] || null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newId || !newLabel) return;

    onAdd({
      id: newId.toUpperCase().trim(),
      label: newLabel.trim(),
      status: 'vacant',
      capacity: parseInt(newCapacity || 4),
      occupied: 0,
      conf: 100,
      auto: true,
      floor: parseInt(newFloor || 1),
      coordinates: [[100, 100], [200, 100], [200, 200], [100, 200]]
    });

    setNewId('');
    setNewLabel('');
    setNewCapacity(4);
    setNewFloor(1);
  };

  const startEditing = (table) => {
    setSelectedId(table.id);
    setEditingId(table.id);
    setEditForm({
      id: table.id,
      label: table.label || '',
      capacity: table.capacity || 4,
      floor: table.floor || 1
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.id || !editForm.label || !onUpdate) return;

    const updatedTable = {
      ...selectedTable,
      id: editForm.id.toUpperCase().trim(),
      label: editForm.label.trim(),
      capacity: parseInt(editForm.capacity || 4),
      floor: parseInt(editForm.floor || 1)
    };

    onUpdate(updatedTable);
    setEditingId('');
    setSelectedId(updatedTable.id);
  };

  const renderInventorySection = (title, list) => (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{title}</span>
        <span className="text-xs text-slate-500">{list.length} items</span>
      </div>
      <div className="divide-y divide-slate-800 bg-slate-950">
        {list.map(table => {
          const isSelected = selectedTable?.id === table.id;
          return (
            <div
              key={table.id}
              className={`flex items-center justify-between px-4 py-3 ${isSelected ? 'bg-slate-900' : ''}`}
            >
              <button onClick={() => setSelectedId(table.id)} className="flex-1 text-left">
                <h4 className="text-sm font-bold text-white">{table.id} - {table.label}</h4>
                <p className="text-xs text-slate-500">
                  Capacity: {table.capacity} • Status: {table.status || 'vacant'}
                </p>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEditing(table)}
                  className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => setSelectedId(table.id)}
                  className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => onDelete(table.id)}
                  className="rounded-lg p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="w-full max-w-7xl space-y-8 p-8">
      <AdminTopbar
        title="Table Asset Management"
        subtitle="Create, edit, preview, and remove table records for both floors."
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Plus size={20} /> Create Asset
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Table ID</label>
                <input
                  type="text"
                  placeholder="T05"
                  value={newId}
                  onChange={e => setNewId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Label</label>
                <input
                  type="text"
                  placeholder="Corner Booth"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={newCapacity}
                    onChange={e => setNewCapacity(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Floor</label>
                  <select
                    value={newFloor}
                    onChange={e => setNewFloor(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Add Asset
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            {editingId && selectedTable ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Edit Asset</h3>
                  <button type="button" onClick={() => setEditingId('')} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Table ID</label>
                  <input
                    type="text"
                    value={editForm.id}
                    onChange={e => setEditForm({ ...editForm, id: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Label</label>
                  <input
                    type="text"
                    value={editForm.label}
                    onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.capacity}
                      onChange={e => setEditForm({ ...editForm, capacity: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Floor</label>
                    <select
                      value={editForm.floor}
                      onChange={e => setEditForm({ ...editForm, floor: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    >
                      <option value="1">1st Floor</option>
                      <option value="2">2nd Floor</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                  <Save size={16} /> Save Changes
                </button>
              </form>
            ) : (
              <div>
                <h3 className="mb-2 text-lg font-bold text-white">Selected Asset</h3>
                {selectedTable ? (
                  <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Asset Details</p>
                    <h4 className="text-2xl font-bold text-white">{selectedTable.id}</h4>
                    <p className="text-sm text-slate-300">{selectedTable.label}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Capacity</p>
                        <p className="mt-1 text-white">{selectedTable.capacity}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Floor</p>
                        <p className="mt-1 text-white">{selectedTable.floor || 1}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No table selected yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
              <p className="mt-1 text-2xl font-bold text-white">{tables.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">1st Floor</p>
              <p className="mt-1 text-2xl font-bold text-white">{floor1Tables.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">2nd Floor</p>
              <p className="mt-1 text-2xl font-bold text-white">{floor2Tables.length}</p>
            </div>
          </div>

          {renderInventorySection('1st Floor', floor1Tables)}
          {renderInventorySection('2nd Floor', floor2Tables)}
        </div>
      </div>
    </div>
  );
};

export default TableManagement;