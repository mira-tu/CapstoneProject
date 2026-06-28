import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Eye, AlertTriangle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminTopbar from '../layouts/AdminTopbar';
import EditModal   from '../components/modals/EditModal';
import ViewModal   from '../components/modals/ViewModal';
import DeleteModal from '../components/modals/DeleteModal';

/**
 * TableManagement
 *
 * Admin page for creating, viewing, editing, and deleting table assets.
 * Also provides the manual status override panel for the selected table.
 *
 * Modals are extracted into components/modals/ to keep this file focused
 * on page-level logic only.
 *
 * @param {Array}    tables          - Current table state array.
 * @param {Function} onAdd           - Called with a new table object.
 * @param {Function} onDelete        - Called with the table ID to remove.
 * @param {Function} onUpdate        - Called with the updated table object.
 * @param {Function} onStatusOverride - Called with (id, status) for manual override.
 * @param {Function} onRestoreAuto   - Called with id to return table to auto detection.
 */
const TableManagement = ({ tables, onAdd, onDelete, onUpdate, onStatusOverride, onRestoreAuto }) => {
  // ── Add form state ──────────────────────────────────────────────────────
  const [newId,       setNewId]       = useState('');
  const [newLabel,    setNewLabel]    = useState('');
  const [newCapacity, setNewCapacity] = useState(4);

  // ── Selection & modal state ─────────────────────────────────────────────
  const [selectedId,    setSelectedId]    = useState('');
  const [editForm,      setEditForm]      = useState({ id: '', label: '', capacity: 4, floor: 1 });
  const [showEdit,      setShowEdit]      = useState(false);
  const [showView,      setShowView]      = useState(false);
  const [showDelete,    setShowDelete]    = useState(false);
  const [tableToEdit,   setTableToEdit]   = useState(null);
  const [tableToView,   setTableToView]   = useState(null);
  const [tableToDelete, setTableToDelete] = useState(null);

  const floor1Tables  = tables.filter(t => t.floor === 1 || !t.floor);
  const selectedTable = tables.find(t => t.id === selectedId) || tables[0] || null;

  // ── Add ─────────────────────────────────────────────────────────────────
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newId || !newLabel) { toast.error('Please fill in all required fields'); return; }

    onAdd({
      id:          newId.toUpperCase().trim(),
      label:       newLabel.trim(),
      status:      'vacant',
      capacity:    parseInt(newCapacity || 4),
      occupied:    0,
      conf:        100,
      auto:        true,
      floor:       1,
      coordinates: [[100, 100], [200, 100], [200, 200], [100, 200]],
    });

    toast.success(`Table ${newId.toUpperCase().trim()} added successfully`);
    setNewId(''); setNewLabel(''); setNewCapacity(4);
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (table) => {
    setTableToEdit(table);
    setEditForm({ id: table.id, label: table.label || '', capacity: table.capacity || 4, floor: table.floor || 1 });
    setShowEdit(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.id || !editForm.label) { toast.error('Please fill in all required fields'); return; }

    const updated = {
      ...tableToEdit,
      id:       editForm.id.toUpperCase().trim(),
      label:    editForm.label.trim(),
      capacity: parseInt(editForm.capacity || 4),
      floor:    parseInt(editForm.floor || 1),
    };

    onUpdate(updated);
    if (selectedId === tableToEdit.id) setSelectedId(updated.id);
    setShowEdit(false);
    toast.success(`Table ${updated.id} updated successfully`);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete = (table) => { setTableToDelete(table); setShowDelete(true); };

  const handleDeleteConfirm = () => {
    if (!tableToDelete) return;
    try {
      onDelete(tableToDelete.id);
      if (selectedId === tableToDelete.id) setSelectedId('');
      toast.success(`Table ${tableToDelete.id} deleted successfully`);
    } catch {
      toast.error('Failed to delete table');
    } finally {
      setShowDelete(false);
      setTableToDelete(null);
    }
  };

  // ── Manual override ───────────────────────────────────────────────────────
  const handleOverride = (status) => {
    if (!selectedTable) return;
    onStatusOverride(selectedTable.id, status);
    toast.success(`Table ${selectedTable.id} status changed to ${status}`);
  };

  const handleRestoreAuto = () => {
    if (!selectedTable) return;
    onRestoreAuto(selectedTable.id);
    toast.success(`Table ${selectedTable.id} returned to automatic detection`);
  };

  return (
    <div className="w-full max-w-7xl space-y-8 p-8">
      <AdminTopbar
        title="Table Asset Management"
        subtitle="Create, edit, preview, and remove table records."
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        {/* ── Left column ─────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Add form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Plus size={20} /> Create Asset
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <Field label="Table ID">
                <input type="text" placeholder="T05" value={newId} onChange={e => setNewId(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Label">
                <input type="text" placeholder="Corner Booth" value={newLabel} onChange={e => setNewLabel(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Capacity">
                <input type="number" min="1" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} className={inputCls} />
              </Field>
              <button type="submit" className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Add Asset
              </button>
            </form>
          </div>

          {/* Selected asset panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Selected Asset</h3>
            {selectedTable ? (
              <div className="space-y-4">
                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Asset Details</p>
                  <h4 className="text-2xl font-bold text-white">{selectedTable.id}</h4>
                  <p className="text-sm text-slate-300">{selectedTable.label}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <MiniStat label="Capacity"       value={selectedTable.capacity} />
                    <MiniStat label="Floor"          value={selectedTable.floor || 1} />
                    <MiniStat label="Current Status" value={<span className="capitalize">{selectedTable.status || 'vacant'}</span>} />
                    <MiniStat label="Occupied"       value={`${selectedTable.occupied || 0} / ${selectedTable.capacity}`} />
                  </div>
                </div>

                {/* Manual override */}
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-orange-500" />
                    <h4 className="text-sm font-bold text-orange-400">Manual Status Override</h4>
                  </div>
                  <p className="mb-3 text-xs text-slate-400">Use only for statuses that require admin intervention.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleOverride('reserved')}    className="rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700">Reserved</button>
                    <button onClick={() => handleOverride('maintenance')} className="rounded-lg bg-slate-600 py-2 text-xs font-semibold text-white hover:bg-slate-700">Maintenance</button>
                  </div>
                  {!selectedTable.auto && (
                    <button onClick={handleRestoreAuto} className="mt-2 w-full rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                      Restore Automatic Detection
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No table selected yet.</p>
            )}
          </div>
        </div>

        {/* ── Right column — inventory list ────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Tables</p>
            <p className="mt-1 text-2xl font-bold text-white">{tables.length}</p>
          </div>

          <InventorySection
            title="Dining Area"
            list={floor1Tables}
            selectedId={selectedTable?.id}
            onSelect={setSelectedId}
            onEdit={openEdit}
            onView={t => { setTableToView(t); setShowView(true); }}
            onDelete={openDelete}
          />
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {showEdit   && tableToEdit   && <EditModal   editForm={editForm} setEditForm={setEditForm} onSubmit={handleEditSubmit} onClose={() => setShowEdit(false)}   />}
      {showView   && tableToView   && <ViewModal   table={tableToView}   onClose={() => setShowView(false)}   />}
      {showDelete && tableToDelete && <DeleteModal table={tableToDelete} onConfirm={handleDeleteConfirm}       onClose={() => setShowDelete(false)} />}

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
    </div>
  );
};

// ─── Small helpers ────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500';

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</label>
    {children}
  </div>
);

const MiniStat = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
    <p className="mt-1 text-white">{value}</p>
  </div>
);

const InventorySection = ({ title, list, selectedId, onSelect, onEdit, onView, onDelete }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{title}</span>
      <span className="text-xs text-slate-500">{list.length} items</span>
    </div>
    <div className="divide-y divide-slate-800 bg-slate-950">
      {list.map(table => (
        <div key={table.id} className={`flex items-center justify-between px-4 py-3 ${selectedId === table.id ? 'bg-slate-900' : ''}`}>
          <button onClick={() => onSelect(table.id)} className="flex-1 text-left">
            <h4 className="text-sm font-bold text-white">{table.id} – {table.label}</h4>
            <p className="text-xs text-slate-500">Capacity: {table.capacity} · Status: {table.status || 'vacant'}</p>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(table)}   className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white" title="Edit">  <Edit3  size={16} /></button>
            <button onClick={() => onView(table)}   className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white" title="View">  <Eye    size={16} /></button>
            <button onClick={() => onDelete(table)} className="rounded-lg p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" title="Delete"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TableManagement;
