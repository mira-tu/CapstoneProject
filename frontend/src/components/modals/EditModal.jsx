import React from 'react';
import { Save, X } from 'lucide-react';

const EditModal = ({ table, editForm, setEditForm, onSave, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(e); // Fixed: Pass the event parameter
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Edit Asset</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>
    </div>
  );
};

export default EditModal;