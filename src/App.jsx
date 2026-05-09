import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { LayoutDashboard, GraduationCap, Bus, Route, MapPin, Calendar, AlertTriangle, Clock, Search, Bell, Menu, ChevronRight, ChevronDown, TrendingUp, TrendingDown, UserX, RefreshCw, Settings, LogOut, ClipboardList } from 'lucide-react';
import './index.css';

const API = 'http://localhost:3001/api';

function StatusBadge({ status, label }) {
  const labels = { a_lheure:'À l\'heure', en_retard:'En retard', annule:'Annulé', active:'Actif', inactive:'Inactif', maintenance:'Maintenance' };
  return (
    <span className={`badge ${status}`}>
      <span className="badge-dot" />
      {label || labels[status] || status}
    </span>
  );
}

function Sidebar({ active, onNav }) {
  const groups = [
    { label:'Aperçu', items:[{ id:'dashboard', label:'Dashboard', icon:<LayoutDashboard size={18}/> }] },
    { label:'Gestion', items:[
      { id:'etudiants', label:'Étudiants', icon:<GraduationCap size={18}/> },
      { id:'lignes', label:'Lignes', icon:<Route size={18}/> },
      { id:'bus', label:'Bus', icon:<Bus size={18}/> },
      { id:'horaires', label:'Horaires', icon:<Calendar size={18}/> },
    ]},
    { label:'Opérations', items:[
      { id:'trajets', label:'Trajets', icon:<ClipboardList size={18}/> },
      { id:'incidents', label:'Incidents', icon:<AlertTriangle size={18}/>, badge:3 },
    ]},
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon"><Bus size={18}/></div>
        <div><div className="sidebar-brand-text">UniTransport</div><div className="sidebar-brand-sub">USTHB</div></div>
      </div>
      <nav className="sidebar-nav">
        {groups.map((g,i) => (
          <div className="nav-group" key={i}>
            <div className="nav-group-label">{g.label}</div>
            {g.items.map(item => (
              <button key={item.id} className={`nav-item ${active===item.id?'active':''}`} onClick={()=>onNav(item.id)}>
                {item.icon}<span style={{flex:1}}>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">AA</div>
          <div><div style={{fontSize:'0.875rem',fontWeight:600}}>Amir Amrani</div><div style={{fontSize:'0.75rem',color:'var(--primary)'}}>Admin</div></div>
        </div>
      </div>
    </aside>
  );
}

function KPIGrid({ kpi }) {
  if (!kpi) return null;
  const cards = [
    { label:'Étudiants Inscrits', value:kpi.totalStudents, sub:`${kpi.subscribedStudents} avec abonnement actif`, icon:<GraduationCap size={20}/>, iconClass:'blue', span:true, trend:{v:'+43 cette semaine',pos:true} },
    { label:'Bus Actifs', value:kpi.activeBuses, sub:`${kpi.maintenanceBuses} en maintenance, ${kpi.inactiveBuses} inactif`, icon:<Bus size={20}/>, iconClass:'sky' },
    { label:'Lignes Actives', value:kpi.activeLines, sub:`${kpi.inactiveLines} suspendue`, icon:<Route size={20}/>, iconClass:'violet' },
    { label:'Incidents Ouverts', value:kpi.openIncidents||3, sub:'retards — action requise', icon:<AlertTriangle size={20}/>, iconClass:'red', alert:true },
    { label:'Sans Abonnement', value:kpi.unsubscribed, sub:`${Math.round(kpi.unsubscribed/kpi.totalStudents*100)}% des inscrits`, icon:<UserX size={20}/>, iconClass:'amber', trend:{v:'-18 cette semaine',pos:true} },
    { label:'Trajets du Jour', value:kpi.totalStudents?'28':'0', sub:'24 à l\'heure · 3 retardés · 1 annulé', icon:<Clock size={20}/>, iconClass:'green', span:true, trend:{v:'85.7% ponctualité',pos:true} },
  ];
  return (
    <div className="kpi-grid">
      {cards.map((c,i) => (
        <div key={i} className={`card kpi-card ${c.alert?'alert':''} ${c.span?'span-2':''}`}>
          <div className="kpi-card-header">
            <div className={`kpi-icon ${c.iconClass}`}>{c.icon}</div>
          </div>
          <div>
            <div className="kpi-label">{c.label}</div>
            <div className={`kpi-value ${c.alert?'danger':''}`}>{c.value}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
            <span className="kpi-subtext">{c.sub}</span>
            {c.trend && <span className={`kpi-trend ${c.trend.pos?'positive':'negative'}`}>{c.trend.pos?<TrendingUp size={12}/>:<TrendingDown size={12}/>}{c.trend.v}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function getBarColor(students, capacity) {
  const r = students/capacity;
  return r>=0.9?'#DC2626':r>=0.75?'#D97706':'#2563EB';
}

function StudentsChart({ data }) {
  if (!data?.length) return null;
  const chartData = data.map(d => ({ ...d, short: d.nom_ligne.split(' — ')[0] }));
  return (
    <div className="card chart-card" style={{gridColumn:'span 3'}}>
      <div className="chart-header">
        <div><div className="chart-title">Étudiants par Ligne</div><div className="chart-subtitle">Abonnements actifs par ligne de transport</div></div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{top:4,right:4,left:-16,bottom:0}} barSize={18}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="short" tick={{fontSize:11,fill:'var(--muted-foreground)'}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:11,fill:'var(--muted-foreground)'}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/>
          <Bar dataKey="nombre_etudiants" radius={[4,4,0,0]}>
            {chartData.map((e,i) => <Cell key={i} fill={getBarColor(e.nombre_etudiants, 40)}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function FillRateChart({ data }) {
  if (!data?.length) return null;
  const chartData = data.filter(d=>d.capacite_flotte>0).map(d=>({...d,short:d.nom_ligne.split(' — ')[0]}));
  const getColor = r => r>=90?'#DC2626':r>=75?'#D97706':'#16A34A';
  return (
    <div className="card chart-card" style={{gridColumn:'span 2'}}>
      <div className="chart-header">
        <div><div className="chart-title">Taux de Remplissage</div><div className="chart-subtitle">Utilisation capacité par ligne</div></div>
      </div>
      <div className="chart-legend" style={{marginBottom:'0.75rem'}}>
        <span style={{display:'flex',alignItems:'center',gap:4}}><span className="chart-legend-dot" style={{background:'#16A34A'}}/>Normal</span>
        <span style={{display:'flex',alignItems:'center',gap:4}}><span className="chart-legend-dot" style={{background:'#D97706'}}/>Élevé</span>
        <span style={{display:'flex',alignItems:'center',gap:4}}><span className="chart-legend-dot" style={{background:'#DC2626'}}/>Surchargé</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{top:0,right:8,left:0,bottom:0}} barSize={14}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[0,100]} tick={{fontSize:11,fill:'var(--muted-foreground)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
          <YAxis type="category" dataKey="short" tick={{fontSize:11,fill:'var(--muted-foreground)'}} axisLine={false} tickLine={false} width={30}/>
          <Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/>
          <ReferenceLine x={90} stroke="#DC2626" strokeDasharray="4 3" strokeWidth={1.5}/>
          <ReferenceLine x={75} stroke="#D97706" strokeDasharray="4 3" strokeWidth={1.5}/>
          <Bar dataKey="taux_remplissage" radius={[0,4,4,0]}>
            {chartData.map((e,i) => <Cell key={i} fill={getColor(e.taux_remplissage)}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function IncidentsFeed({ incidents }) {
  const [filter, setFilter] = useState('all');
  const filtered = incidents.filter(i => {
    if (filter==='open') return i.statut==='en_retard';
    if (filter==='resolved') return i.statut==='a_lheure';
    return true;
  });
  return (
    <div className="card" style={{display:'flex',flexDirection:'column'}}>
      <div className="section-card-header">
        <div className="section-card-title"><AlertTriangle size={17} style={{color:'#DC2626'}}/> Incidents Récents <span className="nav-badge">{incidents.length}</span></div>
        <div className="filter-group">
          {['all','open','resolved'].map(f => (
            <button key={f} className={`filter-pill ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
              {f==='all'?'Tous':f==='open'?'Ouverts':'Résolus'}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',maxHeight:360}}>
        {filtered.map((inc,i) => (
          <div className="feed-item" key={i}>
            <div className={`feed-icon ${inc.statut==='en_retard'?'amber':inc.statut==='annule'?'red':'green'}`}>
              {inc.statut==='annule'?<AlertTriangle size={15}/>:<Clock size={15}/>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div className="feed-text">Bus {inc.immatriculation} — retard de {inc.retard_minutes} min</div>
              <div className="feed-meta">
                <span className="badge line-tag">{inc.nom_ligne}</span>
                <StatusBadge status={inc.statut}/>
                <span style={{marginLeft:'auto',fontSize:'0.75rem',color:'var(--muted-foreground)'}}>{inc.heure_depart}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TripsList({ trips }) {
  const [filter, setFilter] = useState('all');
  const filtered = trips.filter(t => filter==='all'||t.statut===filter);
  const counts = { a_lheure:trips.filter(t=>t.statut==='a_lheure').length, en_retard:trips.filter(t=>t.statut==='en_retard').length, annule:trips.filter(t=>t.statut==='annule').length };
  return (
    <div className="card" style={{display:'flex',flexDirection:'column'}}>
      <div className="section-card-header">
        <div className="section-card-title"><Clock size={17} style={{color:'var(--primary)'}}/> Trajets du Jour</div>
        <div style={{display:'flex',gap:'0.5rem',fontSize:'0.75rem',color:'var(--muted-foreground)'}}>
          <span style={{color:'#16A34A',fontWeight:600}}>{counts.a_lheure}✓</span>
          <span style={{color:'#D97706',fontWeight:600}}>{counts.en_retard}⚠</span>
          <span style={{color:'#DC2626',fontWeight:600}}>{counts.annule}✕</span>
        </div>
      </div>
      <div style={{display:'flex',gap:'0.375rem',padding:'0.75rem 1.25rem',borderBottom:'1px solid var(--border)'}}>
        {['all','a_lheure','en_retard','annule'].map(s => (
          <button key={s} className={`filter-pill ${filter===s?'active':''}`} onClick={()=>setFilter(s)}>
            {s==='all'?'Tous':s==='a_lheure'?'À l\'heure':s==='en_retard'?'En retard':'Annulé'}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',maxHeight:360}}>
        {filtered.map((trip,i) => {
          const fill = trip.capacite_max>0?Math.round(trip.nb_passagers/trip.capacite_max*100):0;
          return (
            <div className="feed-item" key={i} style={{opacity:trip.statut==='annule'?0.6:1}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
                  <span style={{fontWeight:600,fontSize:'0.875rem'}}>{trip.nom_ligne}</span>
                  <StatusBadge status={trip.statut}/>
                  {trip.statut==='en_retard'&&<span style={{fontSize:'0.75rem',color:'#D97706',fontWeight:500}}>+{trip.retard_minutes} min</span>}
                </div>
                <div style={{display:'flex',gap:'0.75rem',marginTop:'0.25rem',fontSize:'0.75rem',color:'var(--muted-foreground)'}}>
                  <span>Bus {trip.immatriculation}</span>
                  <span>{trip.heure_depart} → {trip.heure_arrivee||'--'}</span>
                  {trip.statut!=='annule'&&<span style={{fontWeight:600,color:fill>=90?'#DC2626':fill>=75?'#D97706':'#16A34A'}}>{trip.nb_passagers}/{trip.capacite_max} ({fill}%)</span>}
                </div>
              </div>
              <ChevronRight size={14} style={{color:'var(--muted-foreground)'}}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentsPage({ data }) {
  const [search, setSearch] = useState('');
  const filtered = data.filter(e => `${e.nom} ${e.prenom} ${e.matricule_etud}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <div className="page-header">
        <div><h1 className="page-title">Étudiants</h1><p className="page-subtitle">{data.length} étudiants inscrits</p></div>
      </div>
      <div style={{marginBottom:'1rem',maxWidth:320,position:'relative'}}>
        <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted-foreground)'}}/>
        <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'0.5rem 0.75rem 0.5rem 2.25rem',border:'1px solid var(--input)',borderRadius:8,fontSize:'0.875rem',outline:'none'}}/>
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Email</th><th>Ligne</th><th>Statut</th></tr></thead>
          <tbody>
            {filtered.slice(0,50).map((e,i) => (
              <tr key={i}>
                <td style={{fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{e.matricule_etud}</td>
                <td>{e.nom}</td><td>{e.prenom}</td>
                <td style={{color:'var(--muted-foreground)',fontSize:'0.8125rem'}}>{e.email}</td>
                <td>{e.ligne_actuelle?<span className="badge line-tag">{e.ligne_actuelle}</span>:'—'}</td>
                <td><StatusBadge status={e.ligne_actuelle?'subscribed':'unsubscribed'} label={e.ligne_actuelle?'Abonné':'Sans ligne'}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function LignesPage({ data }) {
  return (
    <>
      <div className="page-header"><div><h1 className="page-title">Lignes de Transport</h1><p className="page-subtitle">{data.length} lignes</p></div></div>
      <div className="card" style={{overflow:'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Ligne</th><th>Stations</th><th>Bus</th><th>Étudiants</th><th>Remplissage</th><th>Statut</th></tr></thead>
          <tbody>
            {data.map((l,i) => (
              <tr key={i}>
                <td style={{fontWeight:600}}>{l.nom_ligne}</td>
                <td>{l.nb_stations}</td><td>{l.nb_bus}</td><td>{l.nb_etudiants}</td>
                <td><span className={`badge ${l.taux_remplissage>=90?'cancelled':l.taux_remplissage>=75?'delayed':'on-time'}`}><span className="badge-dot"/>{l.taux_remplissage}%</span></td>
                <td><StatusBadge status={l.statut}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('today');

  const fetchAll = async () => {
    try {
      const [s, inc, e, l] = await Promise.all([
        fetch(`${API}/stats`).then(r=>r.json()),
        fetch(`${API}/incidents`).then(r=>r.json()),
        fetch(`${API}/etudiants`).then(r=>r.json()),
        fetch(`${API}/lignes`).then(r=>r.json()),
      ]);
      setStats(s); setIncidents(inc); setEtudiants(e); setLignes(l);
    } catch(err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  if (loading) return <div className="loading"><RefreshCw size={24} className="spinner"/> Chargement...</div>;

  return (
    <div className="app-layout">
      <Sidebar active={tab} onNav={setTab}/>
      <div className="main-wrapper">
        <header className="topbar">
          <button className="btn-ghost"><Menu size={20}/></button>
          <div className="topbar-search"><Search size={15}/><input placeholder="Rechercher étudiants, bus, lignes…"/></div>
          <div style={{flex:1}}/>
          <button className="btn-ghost" style={{position:'relative'}}><Bell size={18}/><span style={{position:'absolute',top:6,right:6,width:8,height:8,background:'#DC2626',borderRadius:9999}}/></button>
          <div style={{display:'flex',alignItems:'center',gap:'0.625rem',cursor:'pointer'}}>
            <div className="sidebar-avatar">AA</div>
            <div style={{display:'flex',flexDirection:'column'}}><span style={{fontSize:'0.875rem',fontWeight:600}}>Amir Amrani</span><span style={{fontSize:'0.75rem',color:'var(--primary)',fontWeight:500}}>Admin</span></div>
          </div>
        </header>
        <main className="main-content">
          {tab==='dashboard' && (
            <div className="slide-up">
              <div className="page-header">
                <div><h1 className="page-title">Tableau de Bord Opérationnel</h1><p className="page-subtitle">USTHB Transport — {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>
                <div className="page-actions">
                  <div className="date-range">
                    <Calendar size={14} style={{marginLeft:8,marginRight:4,color:'var(--muted-foreground)'}}/>
                    {[{id:'today',l:'Aujourd\'hui'},{id:'week',l:'Semaine'},{id:'month',l:'Mois'},{id:'semester',l:'Semestre'}].map(r=>(
                      <button key={r.id} className={`date-range-btn ${dateRange===r.id?'active':''}`} onClick={()=>setDateRange(r.id)}>{r.l}</button>
                    ))}
                  </div>
                  <button className="btn-ghost" onClick={handleRefresh}><RefreshCw size={16} className={refreshing?'spinner':''}/></button>
                  <button className="btn-secondary">Exporter</button>
                </div>
              </div>
              <KPIGrid kpi={stats?.kpi}/>
              <div className="charts-grid">
                <StudentsChart data={stats?.studentsPerLine}/>
                <FillRateChart data={stats?.fillRates}/>
              </div>
              <div className="two-col">
                <IncidentsFeed incidents={incidents}/>
                <TripsList trips={stats?.todaysTrips||[]}/>
              </div>
            </div>
          )}
          {tab==='etudiants' && <StudentsPage data={etudiants}/>}
          {tab==='lignes' && <LignesPage data={lignes}/>}
          {(tab==='bus'||tab==='horaires'||tab==='trajets'||tab==='incidents') && (
            <div style={{textAlign:'center',padding:'4rem',color:'var(--muted-foreground)'}}>
              <h2 style={{marginBottom:'0.5rem'}}>Module {tab.charAt(0).toUpperCase()+tab.slice(1)}</h2>
              <p>En cours de développement.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
