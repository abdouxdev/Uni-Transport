import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { Route, Plus, Search, MapPin, Users, Bus as BusIcon, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LinesPage() {
  const { t } = useLang();
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    try {
      const data = await api.getLines();
      setLines(data);
    } catch (err) {
      toast.error('Failed to fetch lines');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.lines.title}</h1>
          <p className="text-sm text-muted mt-1">Manage transport routes and station sequences</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
          <Plus size={18} /> {t.lines.addLine}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-surface-alt/50 animate-pulse rounded-2xl border border-border"></div>
          ))
        ) : lines.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted">No lines found.</div>
        ) : (
          lines.map((line) => (
            <div key={line.id_ligne} className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                    <Route size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{line.nom_ligne}</h3>
                    <p className="text-xs text-muted line-clamp-1">{line.description}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted group-hover:text-primary transition-colors" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
                    <MapPin size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Stations</span>
                  </div>
                  <div className="text-lg font-extrabold text-foreground">{line.nb_stations}</div>
                </div>
                <div className="text-center border-x border-border px-4">
                  <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
                    <BusIcon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Buses</span>
                  </div>
                  <div className="text-lg font-extrabold text-foreground">{line.nb_bus}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
                    <Users size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
                  </div>
                  <div className="text-lg font-extrabold text-foreground">{line.nb_etudiants}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-border h-1.5 w-24 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${line.taux_remplissage >= 90 ? 'bg-danger' : line.taux_remplissage >= 75 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${Math.min(100, line.taux_remplissage)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold tabular-nums">{line.taux_remplissage}% Full</span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${line.statut === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                  {line.statut.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
