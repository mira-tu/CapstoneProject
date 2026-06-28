import React from 'react';
import { X } from 'lucide-react';

/**
 * ViewModal
 *
 * Read-only modal that displays all details of a single table.
 *
 * @param {object}   table   - The table object to display.
 * @param {Function} onClose - Called when the modal is dismissed.
 */
const ViewModal = ({ table, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Asset Details</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <DetailBlock label="Table ID">
          <h4 className="text-2xl font-bold text-white">{table.id}</h4>
        </DetailBlock>

        <DetailBlock label="Label">
          <p className="text-lg text-white">{table.label}</p>
        </DetailBlock>

        <div className="grid grid-cols-2 gap-3">
          <DetailBlock label="Capacity"><p className="text-lg text-white">{table.capacity}</p></DetailBlock>
          <DetailBlock label="Floor"><p className="text-lg text-white">{table.floor || 1}</p></DetailBlock>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DetailBlock label="Status"><p className="text-lg text-white capitalize">{table.status || 'vacant'}</p></DetailBlock>
          <DetailBlock label="Occupied"><p className="text-lg text-white">{table.occupied || 0} / {table.capacity}</p></DetailBlock>
        </div>

        <DetailBlock label="Auto Mode">
          <p className="text-lg text-white">{table.auto ? 'Enabled' : 'Disabled'}</p>
        </DetailBlock>
      </div>
    </div>
  </div>
);

/** Small helper used internally by ViewModal. */
const DetailBlock = ({ label, children }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
    {children}
  </div>
);

export default ViewModal;
