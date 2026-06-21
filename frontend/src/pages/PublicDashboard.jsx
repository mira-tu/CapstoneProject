import React from 'react';
import { Lock } from 'lucide-react';
import tableyeLogo from '../assets/tableye-logo.png';
import TableCard from '../components/TableCard';

const PublicDashboard = ({ tables, onViewChange }) => {
  const vacant = tables.filter(t => t.status === 'vacant').length;
  const partial = tables.filter(t => t.status === 'partial').length;
  const full = tables.filter(t => t.status === 'full').length;
  const merged = tables.filter(t => t.status === 'merged').length;
  const reserved = tables.filter(t => t.status === 'reserved').length;
  const maintenance = tables.filter(t => t.status === 'maintenance').length;

  const total = tables.length;
  const floor1Tables = tables.filter(t => t.floor === 1 || !t.floor);
  const floor2Tables = tables.filter(t => t.floor === 2);

  const floor1Vacant = floor1Tables.filter(t => t.status === 'vacant').length;
  const floor2Vacant = floor2Tables.filter(t => t.status === 'vacant').length;
  const floor1Full = floor1Tables.filter(t => t.status === 'full').length;
  const floor2Full = floor2Tables.filter(t => t.status === 'full').length;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-900 text-white">
      <header className="grid grid-cols-[auto_1fr_auto] items-center border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center">
          <img
            src={tableyeLogo}
            alt="Tableye Logo"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-700"
          />
        </div>

        <div className="text-center">
          <h2 className="mt-1 text-3xl font-bold tracking-[0.35em] text-white">
            TABLEYE
          </h2>
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
            Live Occupancy Dashboard
          </p>
        </div>

        <button
          onClick={() => onViewChange('dashboard')}
          className="ml-auto flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-slate-100 shadow-sm transition hover:bg-slate-700"
          title="Admin View"
        >
          <Lock size={18} />
        </button>
      </header>

      <section className="bg-slate-950 px-4 pb-3 pt-3">
        <div className="mx-auto grid max-w-6xl gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col justify-between rounded-3xl border border-slate-700 bg-slate-800/90 px-8 py-6 text-center shadow-2xl">
            <div>
              <p className="text-base font-medium text-slate-400">CURRENT AVAILABILITY</p>
              <div className="mt-2 flex items-end justify-center gap-2">
                <span className="text-6xl font-black tracking-tight text-green-400">
                  {vacant}
                </span>
                <span className="pb-2 text-3xl font-bold text-slate-500">/ {total}</span>
              </div>
              <p className="mb-4 mt-1 text-lg text-green-400">TABLES AVAILABLE</p>
            </div>

            <div className="flex justify-center gap-8 border-t border-slate-700 pt-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">1st Floor</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {floor1Vacant} <span className="text-sm text-slate-500">/ {floor1Tables.length}</span>
                </p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">2nd Floor</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {floor2Vacant} <span className="text-sm text-slate-500">/ {floor2Tables.length}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="flex flex-col justify-center rounded-3xl border border-slate-700 bg-slate-800/90 px-5 py-4 text-center shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">1st Floor Full</p>
              <p className="mt-1 text-3xl font-bold text-white">{floor1Full} Table/s</p>
            </div>
            <div className="flex flex-col justify-center rounded-3xl border border-slate-700 bg-slate-800/90 px-5 py-4 text-center shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">2nd Floor Full</p>
              <p className="mt-1 text-3xl font-bold text-white">{floor2Full} Table/s</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 pb-3">
        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-2">
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-green-300">Available/Unoccupied</p>
            <p className="mt-1 text-xl font-bold text-green-400">{vacant}</p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-yellow-300">Partially Occupied</p>
            <p className="mt-1 text-xl font-bold text-yellow-400">{partial}</p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-red-300">Fully Occupied</p>
            <p className="mt-1 text-xl font-bold text-red-400">{full}</p>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-orange-300">Merged Table/s</p>
            <p className="mt-1 text-xl font-bold text-orange-400">{merged}</p>
          </div>

          <div className="rounded-2xl border border-slate-600/40 bg-slate-800 p-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Reserved/Maintenance</p>
            <p className="mt-1 text-xl font-bold text-slate-300">{reserved + maintenance}</p>
          </div>
        </div>
      </section>

      <main className="flex min-h-0 flex-1 flex-col items-center px-4 pt-3 pb-2 overflow-hidden">
        <p className="mb-2 text-center text-sm text-slate-400">
          Please check the digital layout below to find your seat.
        </p>

        <div className="grid w-full max-w-7xl flex-1 gap-4 overflow-hidden md:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-inner">
            <div className="mb-4 flex items-center gap-4">
              <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-300">
                1st Floor
              </h3>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {floor1Tables.map(table => (
                <TableCard key={table.id} table={table} isAdmin={false} />
              ))}
            </div>
          </div>

          <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/50 p-4 shadow-inner">
            <div className="mb-4 flex items-center gap-4">
              <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-300">
                2nd Floor
              </h3>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {floor2Tables.map(table => (
                <TableCard key={table.id} table={table} isAdmin={false} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-3 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500"></span> Available/Unoccupied</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-500"></span> Partially Occupied</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500"></span> Fully Occupied</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500"></span> Merged Table/s</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-600"></span> Reserved/Maintenance</span>
        </div>
      </main>
    </div>
  );
};

export default PublicDashboard;