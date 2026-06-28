import React from 'react';
import { STATUS_THEME } from '../../constants/tableStatus';

/**
 * Chair
 * A single chair drawn as a small rounded block (top-down view).
 */
const Chair = ({ theme }) => (
  <div className={`h-3.5 w-6 rounded-md border ${theme.chair} shadow-sm`} />
);

/**
 * ChairRow
 * A horizontal row of chairs placed above or below a table.
 */
const ChairRow = ({ count, theme }) => (
  <div className="flex gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <Chair key={i} theme={theme} />
    ))}
  </div>
);

/**
 * FloorPlanTable
 *
 * Renders one table top-down with optional chair icons above and below.
 * Used on the Public Lobby floor plan canvas.
 *
 * @param {object}  table      - Table data object.
 * @param {boolean} showChairs - Render chair icon rows (default false).
 */
const FloorPlanTable = ({ table, showChairs = false }) => {
  const theme = STATUS_THEME[table.status] || STATUS_THEME.vacant;
  // Cap at 6 seats per project spec.
  const capacity = Math.min(table.capacity || 4, 6);
  const occupied = table.occupied || 0;

  // Split chairs evenly: odd capacity puts the extra on top.
  const topCount    = Math.ceil(capacity / 2);
  const bottomCount = Math.floor(capacity / 2);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {showChairs && <ChairRow count={topCount} theme={theme} />}

      {/* Table surface */}
      <div
        className={`flex h-16 w-28 flex-col items-center justify-center rounded-lg border-2 shadow-lg ${theme.table} ${theme.text}`}
      >
        <span className="text-base font-black leading-none">{table.id}</span>
        <span className="mt-1 text-xs font-bold leading-none">{occupied}/{capacity}</span>
        <span className="mt-0.5 text-[9px] font-semibold leading-none opacity-80">seats</span>
      </div>

      {showChairs && <ChairRow count={bottomCount} theme={theme} />}

      <span className="mt-0.5 max-w-[8rem] truncate text-[10px] font-semibold uppercase tracking-wider text-slate-300">
        {table.label}
      </span>
    </div>
  );
};

export default FloorPlanTable;

// ─── Merged Table ────────────────────────────────────────────────────────────

/**
 * MergedFloorPlanTable
 *
 * Renders two or more physically-merged tables as a single wide block
 * on the floor plan, showing the combined seat count.
 *
 * @param {Array}   tables     - Array of merged table objects.
 * @param {boolean} showChairs - Render chair icon rows (default false).
 */
export const MergedFloorPlanTable = ({ tables = [], showChairs = false }) => {
  if (!tables.length) return null;

  const theme = STATUS_THEME.merged;
  const totalCapacity = tables.reduce((sum, t) => sum + Math.min(t.capacity || 4, 6), 0);
  const totalOccupied = tables.reduce((sum, t) => sum + (t.occupied || 0), 0);
  const combinedId    = tables.map(t => t.id).join(' + ');

  const topCount    = Math.ceil(totalCapacity / 2);
  const bottomCount = Math.floor(totalCapacity / 2);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {showChairs && <ChairRow count={topCount} theme={theme} />}

      {/* One wide surface made of the joined tables sitting flush */}
      <div className={`flex items-stretch rounded-lg border-2 shadow-lg ${theme.table} ${theme.text}`}>
        {tables.map((t, i) => (
          <div
            key={t.id}
            className={`flex h-16 w-28 flex-col items-center justify-center
              ${i > 0 ? 'border-l-2 border-dashed border-orange-200/70' : ''}`}
          >
            <span className="text-base font-black leading-none">{t.id}</span>
          </div>
        ))}
      </div>

      {showChairs && <ChairRow count={bottomCount} theme={theme} />}

      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300">
        Merged · {combinedId}
      </span>
      <span className="text-[10px] font-semibold text-slate-300">
        {totalOccupied}/{totalCapacity} seats
      </span>
    </div>
  );
};
