import React from 'react';

const AdminTopbar = ({ title, subtitle, action }) => (
  <div className="top-0 z-20 mb-8 w-full rounded-xl border border-slate-200 bg-slate-50/95 px-5 py-4 shadow-sm backdrop-blur-md">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  </div>
);

export default AdminTopbar;
