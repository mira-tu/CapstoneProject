import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminWrapper from './layouts/AdminWrapper';
import AdminLogin from './auth/AdminLogin';
import ForgotPassword from './auth/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import PublicDashboard from './pages/PublicDashboard';
import CameraCalibration from './pages/CameraCalibration';
import TableManagement from './pages/TableManagement';
import Analytics from './pages/Analytics';

// --- Occupancy rule (matches the project steering doc) ----------------------
// P = persons detected at the table, C = chair capacity.
//   P == 0        -> 'vacant'  (Available)
//   0 < P < C     -> 'partial' (Partially Occupied)
//   P >= C        -> 'full'    (Fully Occupied)
const computeStatus = (occupied, capacity) => {
  if (occupied <= 0) return 'vacant';
  if (occupied < capacity) return 'partial';
  return 'full';
};

// Statuses set by a human admin. The simulation must NOT touch these tables,
// the same way real detections would be ignored for a reserved/closed table.
const MANUAL_STATUSES = ['reserved', 'maintenance'];

// Friendly labels used in the occupancy log.
const statusLabel = {
  vacant: 'Vacant',
  partial: 'Partial',
  full: 'Full',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
  merged: 'Merged',
};

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [selectedTableId, setSelectedTableId] = useState('T01');

  const [tables, setTables] = useState([
    { id: 'T01', label: 'Window Booth', floor: 1, status: 'vacant', capacity: 4, occupied: 0, conf: 96, auto: true },
    { id: 'T02', label: 'Center Table', floor: 1, status: 'full', capacity: 4, occupied: 4, conf: 91, auto: true },
    { id: 'T03', label: 'Bar Counter', floor: 1, status: 'maintenance', capacity: 2, occupied: 0, conf: null, auto: false },
    { id: 'T04', label: 'Corner Booth', floor: 1, status: 'partial', capacity: 4, occupied: 2, conf: 89, auto: true },
  ]);

  // Historical occupancy log. Newest entries first. Written only when a table's
  // status actually CHANGES (per scope: "log on status change, not every second").
  const [logs, setLogs] = useState([]);

  // Simulation = stand-in for the CCTV/YOLOv8 feed during the prototype stage.
  const [simEnabled, setSimEnabled] = useState(true);
  const tablesRef = useRef(tables);
  tablesRef.current = tables;

  // Add one entry to the occupancy log.
  const addLog = useCallback((table, previous, current, source) => {
    setLogs(prev => [
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        table: table.id,
        previous: statusLabel[previous] || previous,
        current: statusLabel[current] || current,
        source,
      },
      ...prev,
    ].slice(0, 50)); // keep the log from growing forever
  }, []);

  // --- Simulation tick ------------------------------------------------------
  // Every interval we nudge each AUTO table's person count up or down by one,
  // staying within [0, capacity]. Then we recompute its status. If the status
  // changed, we record a log entry. This imitates people arriving/leaving as
  // YOLOv8 would report frame to frame.
  useEffect(() => {
    if (!simEnabled) return undefined;

    const tick = () => {
      const changes = [];

      setTables(prev => prev.map(table => {
        // Skip tables a human has taken over (Reserved / Maintenance) and any
        // table currently part of a merged group (handled by the merge cycle).
        if (!table.auto || MANUAL_STATUSES.includes(table.status) || table.mergeId) return table;

        // 50% of the time this table stays the same, so changes feel natural.
        if (Math.random() < 0.5) return table;

        const capacity = table.capacity || 4;
        const step = Math.random() < 0.5 ? -1 : 1;
        const nextOccupied = Math.min(capacity, Math.max(0, (table.occupied || 0) + step));
        const nextStatus = computeStatus(nextOccupied, capacity);

        if (nextStatus !== table.status) {
          changes.push({ table, previous: table.status, current: nextStatus });
        }

        return {
          ...table,
          occupied: nextOccupied,
          status: nextStatus,
          // A believable detection confidence for the simulated reading.
          conf: 85 + Math.floor(Math.random() * 14),
        };
      }));

      // Log status transitions outside the state updater.
      changes.forEach(c => addLog(c.table, c.previous, c.current, 'YOLOv8 Auto'));
    };

    const timer = window.setInterval(tick, 3000);
    return () => window.clearInterval(timer);
  }, [simEnabled, addLog]);

  // --- Merge / split cycle --------------------------------------------------
  // Demonstrates the "merged table" feature: two tables physically pushed
  // together act as one combined region. Every 12s we toggle T01 + T02 between
  // merged and split, so the Public Lobby shows what a combined table looks like.
  useEffect(() => {
    if (!simEnabled) return undefined;

    const MERGE_PAIR = ['T01', 'T02']; // the two tables we demo-merge
    let merged = false;

    const toggleMerge = () => {
      merged = !merged;

      setTables(prev => prev.map(t => {
        if (!MERGE_PAIR.includes(t.id)) return t;

        if (merged) {
          // Join the pair: mark them merged and tag them with a shared group id.
          return { ...t, status: 'merged', mergeId: 'M1', auto: false };
        }
        // Split them back apart and hand control back to the simulation.
        const restored = computeStatus(t.occupied || 0, t.capacity || 4);
        return { ...t, status: restored, mergeId: null, auto: true };
      }));

      const lead = tablesRef.current.find(t => t.id === MERGE_PAIR[0]);
      if (lead) {
        addLog(
          lead,
          lead.status,
          merged ? 'merged' : computeStatus(lead.occupied || 0, lead.capacity || 4),
          merged ? 'Merge Detected' : 'Split Detected',
        );
      }
    };

    const timer = window.setInterval(toggleMerge, 12000);
    return () => window.clearInterval(timer);
  }, [simEnabled, addLog]);

  // Manual override (Reserved / Maintenance). Logs the change and pauses auto.
  const handleStatusOverride = (id, status) => {
    const table = tablesRef.current.find(t => t.id === id);
    if (!table) return;
    if (table.status !== status) addLog(table, table.status, status, 'Manual Override');

    setTables(prev => prev.map(t => (
      t.id === id
        ? {
            ...t,
            status,
            occupied:
              status === 'full'
                ? t.capacity
                : status === 'partial'
                  ? Math.max(1, Math.floor(t.capacity / 2))
                  : 0,
            auto: false,
          }
        : t
    )));
  };

  // Hand a table back to the simulation/detection engine.
  const handleRestoreAuto = (id) => {
    const table = tablesRef.current.find(t => t.id === id);
    if (!table) return;
    const restoredStatus = computeStatus(table.occupied || 0, table.capacity || 4);
    if (table.status !== restoredStatus) addLog(table, table.status, restoredStatus, 'Admin Action');

    setTables(prev => prev.map(t => (
      t.id === id ? { ...t, auto: true, status: restoredStatus } : t
    )));
  };

  const renderAdminView = () => {
    switch (currentView) {
      case 'login':
        return <AdminLogin onViewChange={setCurrentView} />;
      case 'forgot-password':
        return <ForgotPassword onViewChange={setCurrentView} />;
      case 'dashboard':
        return (
          <AdminDashboard
            tables={tables}
            simEnabled={simEnabled}
            onToggleSim={() => setSimEnabled(s => !s)}
          />
        );
      case 'logs':
        return <Analytics logs={logs} />;
      case 'settings':
        return (
          <AdminSettings
            simEnabled={simEnabled}
            onToggleSim={() => setSimEnabled(s => !s)}
          />
        );
      case 'lobby':
        return <PublicDashboard tables={tables} onViewChange={setCurrentView} />;
      case 'camera-calibration':
        return (
          <CameraCalibration
            tables={tables}
            setTables={setTables}
            selectedTableId={selectedTableId}
            setSelectedTableId={setSelectedTableId}
          />
        );
      case 'table-management':
        return (
          <TableManagement
            tables={tables}
            onAdd={newTable => setTables(prev => [...prev, newTable])}
            onDelete={id => setTables(prev => prev.filter(t => t.id !== id))}
            onUpdate={updatedTable =>
              setTables(prev => prev.map(t => (t.id === updatedTable.id ? updatedTable : t)))
            }
            onStatusOverride={handleStatusOverride}
            onRestoreAuto={handleRestoreAuto}
          />
        );
      case 'analytics':
        return <Analytics logs={logs} />;
      default:
        return <AdminLogin onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Routes>
        <Route
          path="/public"
          element={<PublicDashboard tables={tables} onViewChange={setCurrentView} />}
        />
        <Route
          path="*"
          element={
            currentView === 'login' || currentView === 'lobby' || currentView === 'forgot-password' ? (
              currentView === 'login' ? (
                <AdminLogin onViewChange={setCurrentView} />
              ) : currentView === 'forgot-password' ? (
                <ForgotPassword onViewChange={setCurrentView} />
              ) : (
                <PublicDashboard tables={tables} onViewChange={setCurrentView} />
              )
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
