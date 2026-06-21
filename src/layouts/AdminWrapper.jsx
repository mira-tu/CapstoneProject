import React, { useState } from 'react';
import {
  LayoutDashboard,
  Camera,
  Table2,
  BarChart3,
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import tableyeLogo from '../assets/tableye-logo.png';

const NavItem = ({ active, icon, label, onClick, collapsed = false }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'} ${collapsed ? 'justify-center px-3' : ''}`}
    title={label}
  >
    {icon} {!collapsed && label}
  </button>
);

const AdminWrapper = ({ children, currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out`}>
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
                  className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors duration-200 ease-in-out"
                  aria-label="Toggle sidebar"
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
                className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors duration-200 ease-in-out"
                aria-label="Toggle sidebar"
              >
                <Menu size={18} />
              </button>
            </div>
          )}
        </div>

        <div className={`${isOpen ? 'flex-1 flex flex-col' : 'flex-1 flex flex-col'}`}>
          <nav className="flex-1 p-4 space-y-2">
            <NavItem collapsed={!isOpen} active={currentView === 'dashboard'} icon={<LayoutDashboard />} label="Live Dashboard" onClick={() => onViewChange('dashboard')} />
            <NavItem collapsed={!isOpen} active={currentView === 'camera-calibration'} icon={<Camera />} label="Camera Calibration" onClick={() => onViewChange('camera-calibration')} />
            <NavItem collapsed={!isOpen} active={currentView === 'table-management'} icon={<Table2 />} label="Table Management" onClick={() => onViewChange('table-management')} />
            <NavItem collapsed={!isOpen} active={currentView === 'analytics' || currentView === 'logs'} icon={<BarChart3 />} label="Analytics & Logs" onClick={() => onViewChange('analytics')} />
            <NavItem collapsed={!isOpen} active={currentView === 'settings'} icon={<Settings />} label="System Settings" onClick={() => onViewChange('settings')} />
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => onViewChange('lobby')}
              className={`w-full flex items-center rounded-lg transition-colors ${isOpen ? 'gap-3 px-4 py-2 text-sm text-blue-400 hover:bg-slate-800' : 'justify-center p-3 text-blue-400 hover:bg-slate-800'}`}
              title="Public Lobby View"
            >
              <img
                src={tableyeLogo}
                alt="Tableye Logo"
                className="h-5 w-5 rounded-full object-cover object-center"
              />
              {isOpen && 'Public Lobby View'}
            </button>
            <button
              onClick={() => onViewChange('login')}
              className={`w-full flex items-center rounded-lg transition-colors ${isOpen ? 'gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-800' : 'justify-center p-3 text-red-400 hover:bg-slate-800'}`}
              title="Sign Out"
            >
              <LogOut size={18} />
              {isOpen && 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 flex flex-col bg-slate-50 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminWrapper;
