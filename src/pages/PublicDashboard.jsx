import React from 'react';
import { Lock } from 'lucide-react';
import tableyeLogo from '../assets/tableye-logo.png';
import TableCard from '../components/TableCard';

const PublicDashboard = ({ tables, onViewChange }) => {
  const vacant = tables.filter(t => t.status === 'vacant').length;
  const partial = tables.filter(t => t.status === 'partial').length;
  const full = tables.filter(t => t.status === 'full').length;
  const maintenance = tables.filter(t => t.status === 'maintenance').length;

  return (
    <div className="min-h-screen overflow-hidden bg-slate-900 text-white">
      <header className="grid grid-cols-[auto_1fr_auto] items-center border-b border-slate-800 bg-slate-950 px-6 py-4">
        <div className="flex items-center">
          <img
            src={tableyeLogo}
            alt="Tableye Logo"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-700"
          />
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
            Welcome to
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-[0.35em] text-white">TABLEYE</h2>
        </div>

        <button
          onClick={() => onViewChange('dashboard')}
          className="ml-auto flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-slate-100 shadow-sm transition hover:bg-slate-700"
          title="Admin View"
        >
          <Lock size={18} />
        </button>
      </header>

      <section className="bg-slate-950 px-6 pb-4 pt-5">
        <div className="mx-auto grid max-w-6xl gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-700 bg-slate-800/90 px-8 py-6 text-center shadow-2xl">
            <p className="text-base font-medium text-slate-400">CURRENT AVAILABILITY</p>
            <div className="mt-2 flex items-end justify-center gap-2">
              <span className="text-6xl font-black text-green-400 tracking-tight">{vacant}</span>
              <span className="pb-2 text-3xl font-bold text-slate-500">/ {tables.length}</span>
            </div>
            <p className="mt-1 text-lg text-green-400">TABLES AVAILABLE</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-3xl border border-slate-700 bg-slate-800/90 px-5 py-4 text-center shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Seats in Use</p>
              <p className="mt-1 text-3xl font-bold text-white">{full + partial}</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-800/90 px-5 py-4 text-center shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Not Available</p>
              <p className="mt-1 text-3xl font-bold text-white">{maintenance}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 pb-3">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-green-300">Available</p>
            <p className="mt-1 text-2xl font-bold text-green-400">{vacant}</p>
          </div>
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">Partial</p>
            <p className="mt-1 text-2xl font-bold text-yellow-400">{partial}</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-red-300">Full</p>
            <p className="mt-1 text-2xl font-bold text-red-400">{full}</p>
          </div>
          <div className="rounded-2xl border border-slate-600/40 bg-slate-800 p-3 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Not Available</p>
            <p className="mt-1 text-2xl font-bold text-slate-300">{maintenance}</p>
          </div>
        </div>
      </section>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-6 pt-3">
        <p className="mb-4 text-center text-sm text-slate-400">
          Please check the digital layout below to find your seat.
        </p>

        <div className="grid w-full max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
          {tables.map(table => (
            <TableCard key={table.id} table={table} isAdmin={false} />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-4 rounded-2xl bg-slate-800 px-6 py-3 text-sm font-medium text-slate-300">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500"></span> Available</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-yellow-500"></span> Partial</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500"></span> Full</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500"></span> Merged</span>
        </div>
      </main>
    </div>
  );
};

export default PublicDashboard;