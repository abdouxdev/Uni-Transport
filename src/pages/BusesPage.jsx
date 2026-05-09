import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { Bus, Plus, Search, MapPin, Users, Settings, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BusesPage() {
  const { t } = useLang();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const data = await api.getBuses();
      setBuses(data);
    } catch (err) {
      toast.error('Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.buses.title}</h1>
          <p className="text-sm text-muted mt-1">Manage transport fleet and assignments</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
          <Plus size={18} /> {t.buses.addBus}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-surface-alt/50 animate-pulse rounded-2xl border border-border"></div>
          ))
        ) : buses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted">No buses found.</div>
        ) : (
          buses.map((bus) => (
            <div key={bus.id_bus} className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${getStatusStyle(bus.statut)}`}>
                  <Bus size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-surface-alt rounded-lg text-muted transition-colors"><Edit size={16}/></button>
                  <button className="p-2 hover:bg-red-50 text-muted hover:text-danger rounded-lg transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-lg font-bold text-foreground tabular-nums">{bus.immatriculation}</div>
                  <div className="text-sm text-muted">{bus.modele}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-muted" />
                    <span className="font-semibold">{bus.capacite_max} Seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-muted" />
                    <span className="truncate">{bus.ligne_actuelle || 'Not assigned'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(bus.statut)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${bus.statut === 'active' ? 'bg-green-500' : bus.statut === 'maintenance' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    {bus.statut}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
