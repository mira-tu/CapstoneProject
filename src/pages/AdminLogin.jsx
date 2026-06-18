import React from 'react';
import { User, Lock } from 'lucide-react';
import tableyeLogo from '../assets/tableye-logo.png';

const AdminLogin = ({ onViewChange }) => (
  <div className="flex min-h-screen items-center justify-center bg-[#0e1625] px-4">
    <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#0f5bff] via-[#1d78ff] to-[#5fb8ff] p-10 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">Admin Login</p>
        <div className="mt-4 flex h-45 w-45 items-center justify-center rounded-full bg-white/10 ring-4 ring-white/20 backdrop-blur-sm">
          <img src={tableyeLogo} alt="Tableye Logo" className="h-40 w-40 rounded-full object-cover object-center" />
        </div>
        <h2 className="mt-4 text-center text-4xl font-black tracking-[0.35em]">TABLEYE</h2>
        <p className="mt-2 text-center text-sm text-blue-100">Secure Staff Access</p>
      </div>

      <div className="flex items-center justify-center p-8 md:p-10">
        <div className="w-full max-w-xs space-y-6">
          <div>
            <h3 className="text-center text-4xl font-bold text-slate-900">Welcome Back!</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="admin" className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onViewChange('dashboard')}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default AdminLogin;
