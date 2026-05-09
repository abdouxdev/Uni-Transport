import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentsPage from './pages/StudentsPage';
import BusesPage from './pages/BusesPage';
import LinesPage from './pages/LinesPage';
import SchedulesPage from './pages/SchedulesPage';
import TripsPage from './pages/TripsPage';
import IncidentsPage from './pages/IncidentsPage';
import SettingsPage from './pages/SettingsPage';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="text-9xl font-extrabold text-primary/10 select-none">404</div>
      <div className="relative -mt-20">
        <h1 className="text-3xl font-bold text-foreground">Page introuvable</h1>
        <p className="text-muted mt-2 leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
      >
        Retour au tableau de bord
      </button>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin / Manager Routes */}
      <Route element={<AppLayout requireAuth={true} requireAdmin={true} />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/buses" element={<BusesPage />} />
        <Route path="/lines" element={<LinesPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Student Routes */}
      <Route element={<AppLayout requireAuth={true} requireAdmin={false} />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
