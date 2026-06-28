import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * DeleteModal
 *
 * Confirmation dialog before permanently deleting a table asset.
 *
 * @param {object}   table     - The table to be deleted.
 * @param {Function} onConfirm - Called when the user confirms deletion.
 * @param {Function} onClose   - Called when the user cancels.
 */
const DeleteModal = ({ table, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-rose-500/10 p-3">
          <Trash2 size={24} className="text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-white">Delete Asset</h3>
      </div>

      {/* Message */}
      <p className="mb-6 text-slate-300">
        Are you sure you want to delete{' '}
        <span className="font-bold text-white">{table.id}</span>?{' '}
        This action cannot be undone.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default DeleteModal;
