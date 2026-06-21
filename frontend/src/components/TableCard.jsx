import React from 'react';

const TableCard = ({ table, isAdmin }) => {
  const statusColors = {
    vacant: 'border-green-400 bg-green-50 text-green-800',
    full: 'border-red-400 bg-red-50 text-red-800',
    partial: 'border-yellow-400 bg-yellow-50 text-yellow-800',
    maintenance: 'border-slate-300 bg-slate-100 text-slate-600'
  };

  const statusColorsDark = {
    vacant: 'border-green-500 bg-green-950 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    full: 'border-slate-800 bg-slate-800 text-slate-500 opacity-50',
    partial: 'border-yellow-500 bg-yellow-950 text-yellow-400',
    maintenance: 'border-slate-800 bg-slate-900 text-slate-600 border-dashed'
  };

  const currentColors = isAdmin ? statusColors[table.status] : statusColorsDark[table.status];
  const isMerged = table.merged || table.occupied > table.capacity;
  const extraSeats = Math.max(0, table.occupied - table.capacity);

  return (
    <div className={`relative flex min-h-[96px] flex-col items-center justify-center rounded-xl border-2 p-2 text-center transition-all ${currentColors}`}>
      <h4 className="text-sm font-bold">{table.id}</h4>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider">{table.status}</span>

      {isAdmin ? (
        <div className="mt-1 w-full border-t border-black/10 pt-1 text-center text-[10px]">
          <p>{table.occupied} / {table.capacity} Seats</p>
          <p className="mt-0.5 font-medium opacity-80">
            {table.auto ? `Auto: ${table.conf}% Conf.` : 'Manual Override'}
          </p>
        </div>
      ) : (
        <div className="mt-1 text-center">
          <p className="text-xs font-semibold">{table.occupied} / {table.capacity}</p>
          {isMerged && (
            <div className="mt-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
              {extraSeats > 0 ? `Merged +${extraSeats}` : 'Merged'}
            </div>
          )}
          {!isMerged && (
            <p className="mt-0.5 text-[9px] opacity-80">
              {table.status === 'vacant'
                ? 'Ready now'
                : table.status === 'partial'
                  ? 'Limited seats'
                  : table.status === 'full'
                    ? 'Occupied'
                    : 'Closed'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TableCard;