import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { Clock, Plus, Search, MapPin, Calendar, Route } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SchedulesPage() {
  const { t } = useLang();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await api.getSchedules();
      setSchedules(data);
    } catch (err) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.nav.schedules}</h1>
          <p className="text-sm text-muted mt-1">Configure line departure and arrival times</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
          <Plus size={18} /> Add Schedule
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Line</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Departure</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Arrival</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse h-16"><td colSpan={6}></td></tr>
                ))
              ) : schedules.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted">No schedules configured.</td></tr>
              ) : (
                schedules.map((s, i) => (
                  <tr key={i} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-sm">{s.nom_ligne}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.type_horaire === 'Aller' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {s.type_horaire}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{s.heure_depart}</td>
                    <td className="px-6 py-4 font-mono text-sm">{s.heure_arrivee}</td>
                    <td className="px-6 py-4 text-xs text-muted">Daily (Mon-Thu)</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline text-xs font-bold">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
