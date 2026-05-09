import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { GraduationCap, Bus, Route, AlertTriangle, UserX, Clock, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

function StatusBadge({ status, label }) {
  const styles = {
    a_lheure: 'bg-green-100 text-green-700 border-green-200',
    en_retard: 'bg-amber-100 text-amber-700 border-amber-200',
    annule: 'bg-red-100 text-red-700 border-red-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-red-100 text-red-700 border-red-200',
    maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
    subscribed: 'bg-blue-100 text-blue-700 border-blue-200',
    unsubscribed: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  const dots = {
    a_lheure: 'bg-green-500', en_retard: 'bg-amber-500', annule: 'bg-red-500',
    active: 'bg-green-500', inactive: 'bg-red-500', maintenance: 'bg-amber-500',
    subscribed: 'bg-blue-500', unsubscribed: 'bg-gray-500'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.unsubscribed}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.unsubscribed}`} />
      {label || status}
    </span>
  );
}

export default function DashboardPage() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getIncidents()])
      .then(([s, i]) => {
        setStats(s); 
        setIncidents(i); 
      })
      .catch(err => {
        console.error("Dashboard data fetch failed:", err);
        toast.error(t.common?.error || "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><div className="spinner w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"/></div>;

  const kpi = stats?.kpi;
  const cards = [
    { label: t.dashboard.enrolledStudents, value: kpi?.totalStudents, sub: `${kpi?.subscribedStudents} active`, icon: GraduationCap, color: 'text-blue-600 bg-blue-100', span: true, trend: {v:'+43 this week', pos:true} },
    { label: t.dashboard.activeBuses, value: kpi?.activeBuses, sub: `${kpi?.maintenanceBuses} maintenance`, icon: Bus, color: 'text-sky-600 bg-sky-100' },
    { label: t.dashboard.activeLines, value: kpi?.activeLines, sub: `${kpi?.inactiveLines} suspended`, icon: Route, color: 'text-purple-600 bg-purple-100' },
    { label: t.dashboard.openIncidents, value: kpi?.openIncidents, sub: 'action required', icon: AlertTriangle, color: 'text-red-600 bg-red-100', alert: true },
    { label: t.dashboard.noSubscription, value: kpi?.unsubscribed, sub: kpi?.totalStudents > 0 ? `${Math.round((kpi?.unsubscribed || 0) / kpi.totalStudents * 100)}% of total` : '0% of total', icon: UserX, color: 'text-amber-600 bg-amber-100', trend: {v:'-18 this week', pos:true} },
    { label: t.dashboard.todaysTrips, value: stats?.todaysTrips?.length || 0, sub: 'Scheduled for today', icon: Clock, color: 'text-green-600 bg-green-100', span: true, trend: {v:'85% on time', pos:true} },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
          <p className="text-sm text-muted mt-1">{t.dashboard.subtitle}</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`bg-surface border ${c.alert ? 'border-red-200 bg-red-50/30' : 'border-border'} rounded-2xl p-5 hover:shadow-md transition-shadow ${c.span ? 'xl:col-span-2' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.color}`}><c.icon size={20} /></div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{c.label}</div>
            <div className={`text-3xl font-extrabold tabular-nums leading-none mb-2 ${c.alert ? 'text-red-600' : 'text-foreground'}`}>{c.value}</div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted font-medium">{c.sub}</span>
              {c.trend && (
                <span className={`text-xs font-bold flex items-center gap-1 ${c.trend.pos ? 'text-green-600' : 'text-red-600'}`}>
                  {c.trend.pos ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {c.trend.v}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-surface border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4">{t.dashboard.studentsPerLine}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.studentsPerLine} margin={{top:0,right:0,left:-20,bottom:0}} barSize={16}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="nom_ligne" tickFormatter={v=>v?.split(' — ')[0] || ''} tick={{fontSize:11,fill:'var(--color-muted)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'var(--color-muted)'}} axisLine={false} tickLine={false}/>
              <Tooltip cursor={{fill:'var(--color-surface-alt)'}} contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="nombre_etudiants" fill="var(--color-primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4">{t.dashboard.fillRates}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.fillRates?.filter(d=>d.capacite_flotte>0)} layout="vertical" margin={{top:0,right:0,left:0,bottom:0}} barSize={12}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" domain={[0,100]} tick={{fontSize:11,fill:'var(--color-muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="nom_ligne" tickFormatter={v=>v?.split(' — ')[0] || ''} tick={{fontSize:11,fill:'var(--color-muted)'}} axisLine={false} tickLine={false} width={30}/>
              <Tooltip cursor={{fill:'var(--color-surface-alt)'}} contentStyle={{borderRadius:8,border:'none',boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
              <ReferenceLine x={90} stroke="var(--color-danger)" strokeDasharray="3 3" />
              <Bar dataKey="taux_remplissage" radius={[0,4,4,0]}>
                {(stats?.fillRates || []).filter(d=>d.capacite_flotte>0).map((e,i) => (
                  <Cell key={i} fill={e.taux_remplissage>=90 ? 'var(--color-danger)' : e.taux_remplissage>=75 ? 'var(--color-warning)' : 'var(--color-success)'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-border bg-surface-alt flex justify-between items-center">
            <h3 className="font-bold text-foreground flex items-center gap-2"><AlertTriangle size={16} className="text-danger"/> {t.dashboard.recentIncidents}</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {incidents.map((inc, i) => (
              <div key={i} className="p-4 border-b border-border hover:bg-surface-alt transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-sm">Bus {inc.immatriculation}</div>
                  <StatusBadge status={inc.statut} label={t.dashboard[inc.statut]} />
                </div>
                <div className="text-xs text-muted flex gap-3">
                  <span className="font-medium text-primary bg-primary-light px-2 py-0.5 rounded">{inc.nom_ligne?.split(' — ')[0] || ''}</span>
                  <span>{inc.heure_depart}</span>
                  {inc.retard_minutes > 0 && <span className="text-danger font-bold">+{inc.retard_minutes} min</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-border bg-surface-alt flex justify-between items-center">
            <h3 className="font-bold text-foreground flex items-center gap-2"><Clock size={16} className="text-primary"/> {t.dashboard.todaysTrips}</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {stats?.todaysTrips?.map((trip, i) => (
              <div key={i} className="p-4 border-b border-border hover:bg-surface-alt transition-colors flex items-center gap-4 cursor-pointer">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">{trip.nom_ligne}</span>
                    <StatusBadge status={trip.statut} label={t.dashboard[trip.statut]} />
                  </div>
                  <div className="text-xs text-muted flex gap-4">
                    <span>Bus {trip.immatriculation}</span>
                    <span>{trip.heure_depart} → {trip.heure_arrivee}</span>
                    <span className="font-medium text-foreground">{trip.nb_passagers}/{trip.capacite_max}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
