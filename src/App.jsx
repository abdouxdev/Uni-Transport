import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentDashboard from './pages/StudentDashboard';

// Placeholder components for Phase 2
const Placeholder = ({ title }) => (
  <div className="flex h-full items-center justify-center text-muted flex-col gap-2">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p>Module in development (Phase 2)</p>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin / Manager Routes */}
      <Route element={<AppLayout requireAuth={true} requireAdmin={true} />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<Placeholder title="Students Management" />} />
        <Route path="/buses" element={<Placeholder title="Buses Management" />} />
        <Route path="/lines" element={<Placeholder title="Lines Management" />} />
        <Route path="/schedules" element={<Placeholder title="Schedules" />} />
        <Route path="/trips" element={<Placeholder title="Trips" />} />
        <Route path="/incidents" element={<Placeholder title="Incidents" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
      </Route>

      {/* Student Routes */}
      <Route element={<AppLayout requireAuth={true} requireAdmin={false} />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
