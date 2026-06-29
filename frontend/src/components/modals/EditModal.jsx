import React from 'react';
import { X, Save, ChevronDown } from 'lucide-react';

/**
 * EditModal
 *
 * Modal dialog for editing an existing table's details.
 *
 * @param {object}   editForm    - Controlled form state { id, label, capacity, floor }.
 * @param {Function} setEditForm - Setter for editForm.
 * @param {Function} onSubmit    - Called with the form event on save.
 * @param {Function} onClose     - Called when the modal is dismissed.
 */
const EditModal = ({ editForm, setEditForm, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Edit Asset</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
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
            <input
              type="number"
              min="1"
              value={editForm.floor}
              onChange={e => setEditForm({ ...editForm, floor: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Section / Area</label>
            <div className="relative">
              <select
                value={editForm.section}
                onChange={e => setEditForm({ ...editForm, section: e.target.value })}
                className="peer w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 appearance-none cursor-pointer pr-10 hover:bg-slate-900 transition-colors"
              >
                <option value="">Select Area</option>
                <option value="Window">Window Booth</option>
                <option value="Center">Center Area</option>
                <option value="Bar">Bar Counter</option>
                <option value="Private">Private Dining</option>
                <option value="Outdoor">Outdoor</option>
                <option value="General">General</option>
              </select>
              <ChevronDown 
                size={18} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform duration-200 peer-focus:rotate-180 peer-focus-within:rotate-180" 
              />
            </div>
          </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Save size={16} /> Save Changes
        </button>
      </form>
    </div>
  </div>
);

export default EditModal;
