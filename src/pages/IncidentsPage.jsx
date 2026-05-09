import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { AlertTriangle, Clock, MapPin, Bus, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function IncidentsPage() {
  const { t } = useLang();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'a_lheure': return 'text-success bg-success/10 border-success/20';
      case 'en_retard': return 'text-warning bg-warning/10 border-warning/20';
      case 'annule': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-muted bg-muted/10 border-muted/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.nav.incidents}</h1>
          <p className="text-sm text-muted mt-1">Track delays and service interruptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-surface-alt/50 animate-pulse rounded-2xl border border-border"></div>
          ))
        ) : incidents.length === 0 ? (
          <div className="py-12 text-center text-muted bg-surface border border-border rounded-2xl">No recent incidents reported.</div>
        ) : (
          incidents.map((inc, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5 hover:shadow-sm transition-shadow flex flex-col md:flex-row md:items-center gap-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${inc.statut === 'en_retard' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                <AlertTriangle size={24} />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground">{inc.nom_ligne}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(inc.statut)}`}>
                    {inc.statut.replace('_', ' ')}
                  </span>
                  {inc.retard_minutes > 0 && (
                    <span className="text-danger font-bold text-xs">+{inc.retard_minutes} MIN DELAY</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1"><Bus size={12}/> Bus {inc.immatriculation}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {inc.heure_depart}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="px-4 py-2 bg-surface-alt hover:bg-border rounded-xl text-xs font-bold transition-colors">Mark Resolved</button>
                <button className="p-2 hover:bg-surface-alt rounded-xl text-muted"><XCircle size={18}/></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
