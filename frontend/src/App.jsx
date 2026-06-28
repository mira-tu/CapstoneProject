import React, { useState, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';

// Layouts
import AdminWrapper from './layouts/AdminWrapper';

// Auth pages
import AdminLogin    from './auth/AdminLogin';
import ForgotPassword from './auth/ForgotPassword';

// Admin pages
import AdminDashboard    from './pages/AdminDashboard';
import AdminSettings     from './pages/AdminSettings';
import Analytics         from './pages/Analytics';
import CameraCalibration from './pages/CameraCalibration';
import TableManagement   from './pages/TableManagement';

// Public page
import PublicDashboard from './pages/PublicDashboard';

// Custom hooks — each responsible for one concern
import { useOccupancyLog }    from './hooks/useOccupancyLog';
import { useTableSimulation } from './hooks/useTableSimulation';
import { useMergeSimulation } from './hooks/useMergeSimulation';

// Shared utilities
import { computeStatus } from './constants/tableStatus';

/**
 * App
 *
 * Top-level component. Owns the shared table state and wires together
 * the three simulation hooks. Routing and view switching live here.
 * All business logic is delegated to hooks or page components.
 */
export default function App() {
  const [currentView,      setCurrentView]      = useState('login');
  const [selectedTableId,  setSelectedTableId]  = useState('T01');
  const [simEnabled,       setSimEnabled]        = useState(true);

  // ── Shared table state ────────────────────────────────────────────────────
  // x, y = position on the floor plan canvas as a % of the container.
  // Updated automatically when the admin saves a calibration region.
  const [tables, setTables] = useState([
    { id: 'T01', label: 'Window Booth', floor: 1, status: 'vacant',      capacity: 4, occupied: 0, conf: 96,   auto: true,  x: 15, y: 20 },
    { id: 'T02', label: 'Center Table', floor: 1, status: 'full',        capacity: 4, occupied: 4, conf: 91,   auto: true,  x: 45, y: 20 },
    { id: 'T03', label: 'Bar Counter',  floor: 1, status: 'maintenance', capacity: 2, occupied: 0, conf: null, auto: false, x: 75, y: 20 },
    { id: 'T04', label: 'Corner Booth', floor: 1, status: 'partial',     capacity: 4, occupied: 2, conf: 89,   auto: true,  x: 75, y: 65 },
  ]);

  const tablesRef = useRef(tables);
  tablesRef.current = tables;

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { logs, addLog }   = useOccupancyLog();
  useTableSimulation(simEnabled, setTables, addLog);
  useMergeSimulation(simEnabled, setTables, addLog);

  // ── Manual override handlers ──────────────────────────────────────────────
  const handleStatusOverride = (id, status) => {
    const table = tablesRef.current.find(t => t.id === id);
    if (!table) return;
    if (table.status !== status) addLog(table, table.status, status, 'Manual Override');

    setTables(prev => prev.map(t =>
      t.id === id ? {
        ...t,
        status,
        occupied: status === 'full'    ? t.capacity
                : status === 'partial' ? Math.max(1, Math.floor(t.capacity / 2))
                : 0,
        auto: false,
      } : t,
    ));
  };

  const handleRestoreAuto = (id) => {
    const table = tablesRef.current.find(t => t.id === id);
    if (!table) return;
    const restoredStatus = computeStatus(table.occupied || 0, table.capacity || 4);
    if (table.status !== restoredStatus) addLog(table, table.status, restoredStatus, 'Admin Action');
    setTables(prev => prev.map(t => t.id === id ? { ...t, auto: true, status: restoredStatus } : t));
  };

  // ── View renderer ─────────────────────────────────────────────────────────
  const renderAdminView = () => {
    switch (currentView) {
      case 'login':            return <AdminLogin    onViewChange={setCurrentView} />;
      case 'forgot-password':  return <ForgotPassword onViewChange={setCurrentView} />;
      case 'dashboard':        return <AdminDashboard  tables={tables} simEnabled={simEnabled} onToggleSim={() => setSimEnabled(s => !s)} />;
      case 'logs':
      case 'analytics':        return <Analytics       logs={logs} />;
      case 'settings':         return <AdminSettings   simEnabled={simEnabled} onToggleSim={() => setSimEnabled(s => !s)} />;
      case 'lobby':            return <PublicDashboard tables={tables} onViewChange={setCurrentView} />;
      case 'camera-calibration': return (
        <CameraCalibration
          tables={tables}
          setTables={setTables}
          selectedTableId={selectedTableId}
          setSelectedTableId={setSelectedTableId}
        />
      );
      case 'table-management': return (
        <TableManagement
          tables={tables}
          onAdd={newTable => setTables(prev => [...prev, newTable])}
          onDelete={id => setTables(prev => prev.filter(t => t.id !== id))}
          onUpdate={updated => setTables(prev => prev.map(t => t.id === updated.id ? updated : t))}
          onStatusOverride={handleStatusOverride}
          onRestoreAuto={handleRestoreAuto}
        />
      );
      default: return <AdminLogin onViewChange={setCurrentView} />;
    }
  };

  // ── Routes ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Routes>
        {/* Public lobby is accessible without login */}
        <Route
          path="/public"
          element={<PublicDashboard tables={tables} onViewChange={setCurrentView} />}
        />

        {/* Everything else is routed through the view switcher */}
        <Route
          path="*"
          element={
            currentView === 'login' || currentView === 'forgot-password' || currentView === 'lobby' ? (
              renderAdminView()
            ) : (
              <AdminWrapper currentView={currentView} onViewChange={setCurrentView}>
                {renderAdminView()}
              </AdminWrapper>
            )
          }
        />
      </Routes>
    </div>
  );
}
