import React, { useState } from 'react';
import {
  LayoutDashboard,
  Camera,
  Table2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import tableyeLogo from '../assets/tableye-logo.png';

/**
 * NavItem
 * A single sidebar navigation button.
 */
const NavItem = ({ active, icon, label, onClick, collapsed = false }) => (
  <button
    onClick={onClick}
    title={label}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
      ${active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}
      ${collapsed ? 'justify-center px-3' : ''}`}
  >
    {icon}
    {!collapsed && label}
  </button>
);

/**
 * AdminWrapper
 *
 * Persistent sidebar layout that wraps all admin pages.
 * Passes children (the active page) into the scrollable main area.
 *
 * @param {ReactNode} children     - The active page component.
 * @param {string}    currentView  - Active view key (used to highlight nav item).
 * @param {Function}  onViewChange - Callback to change the active view.
 */
const AdminWrapper = ({ children, currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Logo / toggle */}
        <div className={`border-b border-slate-800 ${isOpen ? 'p-4' : 'p-3'}`}>
          {isOpen ? (
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-wider text-white">
                  <img src={tableyeLogo} alt="Tableye Logo" className="h-8 w-8 rounded-full object-cover" />
                  TABLEYE
                </h1>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <Menu size={18} />
                </button>
              </div>
              <p className="mt-2 px-1 text-xs text-slate-500">Smart Occupancy System</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                aria-label="Expand sidebar"
              >
                <Menu size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-2">
          <NavItem collapsed={!isOpen} active={currentView === 'dashboard'}        icon={<LayoutDashboard />} label="Dashboard"          onClick={() => onViewChange('dashboard')} />
          <NavItem collapsed={!isOpen} active={currentView === 'camera-calibration'} icon={<Camera />}         label="Camera Calibration" onClick={() => onViewChange('camera-calibration')} />
          <NavItem collapsed={!isOpen} active={currentView === 'table-management'} icon={<Table2 />}          label="Table Management"   onClick={() => onViewChange('table-management')} />
          <NavItem collapsed={!isOpen} active={currentView === 'analytics' || currentView === 'logs'} icon={<BarChart3 />} label="Analytics & Logs" onClick={() => onViewChange('analytics')} />
          <NavItem collapsed={!isOpen} active={currentView === 'settings'}         icon={<Settings />}        label="System Settings"    onClick={() => onViewChange('settings')} />
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => onViewChange('lobby')}
            title="Public Lobby View"
            className={`w-full flex items-center rounded-lg transition-colors text-blue-400 hover:bg-slate-800
              ${isOpen ? 'gap-3 px-4 py-2 text-sm' : 'justify-center p-3'}`}
          >
            <img src={tableyeLogo} alt="Tableye Logo" className="h-5 w-5 rounded-full object-cover" />
            {isOpen && 'Public Lobby View'}
          </button>
          <button
            onClick={() => onViewChange('login')}
            title="Sign Out"
            className={`w-full flex items-center rounded-lg transition-colors text-red-400 hover:bg-slate-800
              ${isOpen ? 'gap-3 px-4 py-2 text-sm' : 'justify-center p-3'}`}
          >
            <LogOut size={18} />
            {isOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 flex flex-col bg-slate-50 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminWrapper;
