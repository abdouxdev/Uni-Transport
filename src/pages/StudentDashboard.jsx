import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { Route, Clock, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      api.getStudentHistory(user.id)
        .then(res => setHistory(Array.isArray(res) ? res : []))
        .catch(err => {
          console.error("Student history fetch failed:", err);
          toast.error("Failed to load your history");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="flex h-full items-center justify-center"><div className="spinner w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"/></div>;

  const activeSub = (history || []).find(h => h.statut === 'Actif');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.prenom}!</h1>
        <p className="text-blue-100 opacity-90">Student ID: {user?.matricule}</p>
        
        <div className="mt-8 p-5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <Route className="text-blue-200" />
            <h2 className="text-xl font-semibold">Your Current Subscription</h2>
          </div>
          {activeSub ? (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="text-2xl font-bold">{activeSub.nom_ligne}</div>
                <div className="text-sm text-blue-100 mt-1">Active since {activeSub.date_debut}</div>
              </div>
              <div className="px-3 py-1 bg-green-400/20 text-green-100 border border-green-400/30 rounded-lg text-sm font-semibold">
                Status: Active
              </div>
            </div>
          ) : (
            <div className="text-blue-100">You don't have an active transport subscription.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Calendar className="text-primary"/> Next Bus Schedule</h3>
          {activeSub ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">07:30</div>
                  <div>
                    <div className="font-semibold text-sm">Morning Departure</div>
                    <div className="text-xs text-muted">Usually arrives at 08:15</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded">On Time</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Subscribe to a line to view schedules.</p>
          )}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><MapPin className="text-primary"/> Route Information</h3>
          {activeSub ? (
            <div className="relative pl-4 border-l-2 border-border space-y-6 mt-2">
              <div className="relative">
                <span className="absolute -left-[21px] w-3 h-3 rounded-full bg-primary ring-4 ring-surface" />
                <p className="text-sm font-semibold">USTHB Main Gate</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] w-3 h-3 rounded-full bg-border ring-4 ring-surface" />
                <p className="text-sm font-medium text-muted">Intermediate stops...</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] w-3 h-3 rounded-full bg-foreground ring-4 ring-surface" />
                <p className="text-sm font-semibold">Destination</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">No route information available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
