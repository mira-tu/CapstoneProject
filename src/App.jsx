import React, { useState } from 'react';
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

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [selectedTableId, setSelectedTableId] = useState('T01');

  const [tables, setTables] = useState([
    { id: 'T01', label: 'Window Booth', floor: 1, status: 'vacant', capacity: 4, occupied: 0, conf: 96, auto: true },
    { id: 'T02', label: 'Center Table', floor: 1, status: 'full', capacity: 4, occupied: 4, conf: 91, auto: true },
    { id: 'T03', label: 'Bar Counter', floor: 2, status: 'maintenance', capacity: 2, occupied: 0, conf: null, auto: false },
    { id: 'T04', label: 'Corner Booth', floor: 1, status: 'partial', capacity: 4, occupied: 2, conf: 89, auto: true },
  ]);

  const renderAdminView = () => {
    switch (currentView) {
      case 'login':
        return <AdminLogin onViewChange={setCurrentView} />;
      case 'forgot-password':
        return <ForgotPassword onViewChange={setCurrentView} />;
      case 'dashboard':
        return <AdminDashboard tables={tables} />;
      case 'logs':
        return <Analytics />;
      case 'settings':
        return <AdminSettings />;
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
          />
        );
      case 'analytics':
        return <Analytics />;
      default:
        return <AdminLogin onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
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
