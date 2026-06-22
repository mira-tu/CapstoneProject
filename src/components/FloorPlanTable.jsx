import React from 'react';

// --- Color theme per status -------------------------------------------------
// Each status colors the table block, the chairs, and the text together so the
// whole "seat group" reads as one unit on the floor plan.
const statusTheme = {
  vacant: {
    table: 'bg-green-600/90 border-green-300',
    chair: 'bg-green-400 border-green-200',
    text: 'text-white',
  },
  partial: {
    table: 'bg-yellow-500/90 border-yellow-200',
    chair: 'bg-yellow-300 border-yellow-100',
    text: 'text-yellow-950',
  },
  full: {
    table: 'bg-red-600/90 border-red-300',
    chair: 'bg-red-400 border-red-200',
    text: 'text-white',
  },
  merged: {
    table: 'bg-orange-600/90 border-orange-300',
    chair: 'bg-orange-400 border-orange-200',
    text: 'text-white',
  },
  reserved: {
    table: 'bg-slate-600/90 border-slate-400',
    chair: 'bg-slate-500 border-slate-400',
    text: 'text-slate-100',
  },
  maintenance: {
    table: 'bg-slate-600/90 border-slate-400',
    chair: 'bg-slate-500 border-slate-400',
    text: 'text-slate-100',
  },
};

// A single chair, drawn as a small rounded block (top-down view).
const Chair = ({ theme }) => (
  <div className={`h-3.5 w-6 rounded-md border ${theme.chair} shadow-sm`} />
);

// A row of chairs (used for the top and bottom edges of the table).
const ChairRow = ({ count, theme }) => (
  <div className="flex gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <Chair key={i} theme={theme} />
    ))}
  </div>
);

// One table rendered top-down with optional chair icons around it.
// showChairs (default false) — renders the chair icon rows above/below the table.
// The seat count ("0/4 seats") is always visible on the table surface.
const FloorPlanTable = ({ table, showChairs = false }) => {
  const theme = statusTheme[table.status] || statusTheme.vacant;
  // Cap capacity at 6 per project spec (max 6 seats per table).
  const capacity = Math.min(table.capacity || 4, 6);
  const occupied = table.occupied || 0;

  // Split the chairs evenly between the top and bottom edges of the table.
  // Odd counts put the extra chair on top (e.g. capacity 3 -> 2 top, 1 bottom).
  const topCount = Math.ceil(capacity / 2);
  const bottomCount = Math.floor(capacity / 2);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Chair icons — hidden by default, pass showChairs={true} to reveal */}
      {showChairs && <ChairRow count={topCount} theme={theme} />}

      {/* The table surface */}
      <div
        className={`flex h-16 w-28 flex-col items-center justify-center rounded-lg border-2 shadow-lg ${theme.table} ${theme.text}`}
      >
        <span className="text-base font-black leading-none">{table.id}</span>
        <span className="mt-1 text-xs font-bold leading-none">
          {occupied}/{capacity}
        </span>
        <span className="mt-0.5 text-[9px] font-semibold leading-none opacity-80">
          seats
        </span>
      </div>

      {/* Chair icons — hidden by default */}
      {showChairs && <ChairRow count={bottomCount} theme={theme} />}

      {/* Table name under the seat group */}
      <span className="mt-0.5 max-w-[8rem] truncate text-[10px] font-semibold uppercase tracking-wider text-slate-300">
        {table.label}
      </span>
    </div>
  );
};

export default FloorPlanTable;

// --- Merged table ----------------------------------------------------------
// Renders two (or more) tables that have been physically pushed together as a
// single wide combined block, so the floor plan shows them as one seating unit.
export const MergedFloorPlanTable = ({ tables = [], showChairs = false }) => {
  if (!tables.length) return null;

  const theme = statusTheme.merged;
  // Combined seat figures across all tables in the group (capped at 6 each).
  const totalCapacity = tables.reduce((sum, t) => sum + Math.min(t.capacity || 4, 6), 0);
  const totalOccupied = tables.reduce((sum, t) => sum + (t.occupied || 0), 0);
  const combinedId = tables.map(t => t.id).join(' + ');

  // Chairs split across the long top and bottom edges of the joined block.
  const topCount = Math.ceil(totalCapacity / 2);
  const bottomCount = Math.floor(totalCapacity / 2);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {showChairs && <ChairRow count={topCount} theme={theme} />}

      {/* One wide surface made of the joined tables sitting flush together */}
      <div className={`flex items-stretch rounded-lg border-2 shadow-lg ${theme.table} ${theme.text}`}>
        {tables.map((t, i) => (
          <div
            key={t.id}
            className={`flex h-16 w-28 flex-col items-center justify-center ${
              i > 0 ? 'border-l-2 border-dashed border-orange-200/70' : ''
            }`}
          >
            <span className="text-base font-black leading-none">{t.id}</span>
          </div>
        ))}
      </div>

      {showChairs && <ChairRow count={bottomCount} theme={theme} />}

      {/* Combined label + merged seat total */}
      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300">
        Merged · {combinedId}
      </span>
      <span className="text-[10px] font-semibold text-slate-300">
        {totalOccupied}/{totalCapacity} seats
      </span>
    </div>
  );
};
