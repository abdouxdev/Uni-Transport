import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { ClipboardList, Plus, Search, Bus, Route, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TripsPage() {
  const { t } = useLang();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await api.getTrips();
      setTrips(data);
    } catch (err) {
      toast.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'termine': return 'bg-green-100 text-green-700 border-green-200';
      case 'en_cours': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'annule': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.nav.trips}</h1>
          <p className="text-sm text-muted mt-1">Live trip logs and passenger counts</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
          <Plus size={18} /> New Trip Log
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Bus</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Line</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Passengers</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse h-16"><td colSpan={6}></td></tr>
                ))
              ) : trips.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted">No trip data available.</td></tr>
              ) : (
                trips.map((trip, i) => (
                  <tr key={i} className="hover:bg-surface-alt/50 transition-colors text-sm">
                    <td className="px-6 py-4 text-muted">{trip.date_trajet}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Bus size={14} className="text-primary" />
                        <span className="font-mono font-medium">{trip.immatriculation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{trip.nom_ligne}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-border h-1.5 w-12 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(trip.nb_passagers/trip.capacite_max)*100}%` }} />
                        </div>
                        <span className="text-xs font-bold">{trip.nb_passagers}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusStyle(trip.statut)}`}>
                        {trip.statut === 'termine' ? <CheckCircle2 size={10}/> : <AlertCircle size={10}/>}
                        {trip.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 hover:bg-surface-alt rounded-lg transition-colors text-muted">Details</button>
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
