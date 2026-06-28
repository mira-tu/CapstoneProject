import React from 'react';
import { STATUS_COLORS_LIGHT, STATUS_COLORS_DARK } from '../../constants/tableStatus';

/**
 * TableCard
 *
 * Compact card used in the Admin Dashboard grid.
 * Uses a light color theme when isAdmin=true, dark theme otherwise.
 *
 * @param {object}  table      - Table data object.
 * @param {boolean} isAdmin    - Switches between light (admin) and dark (public) theme.
 * @param {boolean} showSeats  - Whether to show the seat count.
 */
const TableCard = ({ table, isAdmin = false, showSeats = true }) => {
  // Cap capacity at 6 per project spec.
  const capacity = Math.min(table.capacity || 4, 6);
  const currentColors = isAdmin
    ? STATUS_COLORS_LIGHT[table.status] || STATUS_COLORS_LIGHT.vacant
    : STATUS_COLORS_DARK[table.status] || STATUS_COLORS_DARK.vacant;

  const isMerged = table.merged || table.occupied > capacity;
  const extraSeats = Math.max(0, table.occupied - capacity);

  return (
    <div
      className={`relative flex min-h-[96px] flex-col items-center justify-center rounded-xl border-2 p-2 text-center transition-all ${currentColors}`}
    >
      <h4 className="text-sm font-bold">{table.id}</h4>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider">{table.status}</span>

      {isAdmin ? (
        <div className="mt-1 w-full border-t border-black/10 pt-1 text-center text-[10px]">
          {showSeats && (
            <>
              <p>{table.occupied} / {capacity}</p>
              <p className="font-semibold">seats</p>
            </>
          )}
          <p className="mt-0.5 font-medium opacity-80">
            {table.auto ? `Auto: ${table.conf}% Conf.` : 'Manual Override'}
          </p>
        </div>
      ) : (
        <div className="mt-1 text-center">
          {showSeats && (
            <>
              <p className="text-xs font-semibold">{table.occupied} / {capacity}</p>
              <p className="text-[9px] font-semibold">seats</p>
            </>
          )}
          {isMerged && (
            <div className="mt-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
              {extraSeats > 0 ? `Merged +${extraSeats}` : 'Merged'}
            </div>
          )}
          {!isMerged && (
            <p className="mt-0.5 text-[9px] opacity-80">
              {table.status === 'vacant'   ? 'Ready now'
               : table.status === 'partial' ? 'Limited seats'
               : table.status === 'full'    ? 'Occupied'
               : 'Closed'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TableCard;
