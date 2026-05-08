import React, { useState, useEffect } from 'react';
import { BusFront, Users, Map, AlertTriangle, LayoutDashboard, Clock } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, incidentsRes] = await Promise.all([
          fetch(`${API_BASE}/stats`),
          fetch(`${API_BASE}/incidents`)
        ]);
        
        const statsData = await statsRes.json();
        const incidentsData = await incidentsRes.json();
        
        setStats(statsData);
        setIncidents(incidentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderDashboard = () => {
    if (loading) return <div className="loading">Chargement des données...</div>;
    
    // Calculate total students and average fill rate
    const totalStudents = stats?.studentsPerLine?.reduce((acc, curr) => acc + curr.nombre_etudiants, 0) || 0;
    const avgFillRate = stats?.fillRates?.reduce((acc, curr) => acc + curr.taux_remplissage, 0) / (stats?.fillRates?.length || 1) || 0;

    return (
      <>
        <div className="page-header">
          <div>
            <h1 className="page-title">Tableau de Bord</h1>
            <p className="page-subtitle">Aperçu en temps réel du réseau de transport universitaire</p>
          </div>
          <button className="btn btn-primary">
            <Map className="w-4 h-4" /> Voir la Carte
          </button>
        </div>

        <div className="grid-cards">
          <div className="card">
            <div className="card-header">
              <span>TOTAL ÉTUDIANTS ABONNÉS</span>
              <Users className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="card-value">{totalStudents}</div>
          </div>
          <div className="card">
            <div className="card-header">
              <span>LIGNES ACTIVES</span>
              <Map className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
            </div>
            <div className="card-value">{stats?.studentsPerLine?.length || 0}</div>
          </div>
          <div className="card">
            <div className="card-header">
              <span>TAUX DE REMPLISSAGE MOYEN</span>
              <BusFront className="w-5 h-5" style={{ color: 'var(--warning)' }} />
            </div>
            <div className="card-value">{avgFillRate.toFixed(1)}%</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Taux de remplissage par ligne</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ligne</th>
                    <th>Abonnés</th>
                    <th>Capacité Flotte</th>
                    <th>Remplissage</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.fillRates?.map((rate, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{rate.nom_ligne}</td>
                      <td>{rate.total_abonnes}</td>
                      <td>{rate.capacite_flotte}</td>
                      <td>
                        <span className={`badge ${rate.taux_remplissage > 90 ? 'badge-danger' : rate.taux_remplissage > 70 ? 'badge-warning' : 'badge-success'}`}>
                          {rate.taux_remplissage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: 'var(--danger)' }} />
              Incidents & Retards
            </h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date / Heure Prévue</th>
                    <th>Ligne / Bus</th>
                    <th>Statut</th>
                    <th>Retard</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.length > 0 ? incidents.map((inc, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontSize: '0.875rem' }}>{inc.date_trajet}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{inc.heure_depart}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{inc.nom_ligne}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{inc.immatriculation}</div>
                      </td>
                      <td><span className="badge badge-warning">{inc.statut}</span></td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>+{inc.retard_minutes} min</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="empty-state">Aucun retard signalé. Le réseau est fluide.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderPlaceholder = (title) => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h2>
      <p>Module en cours de développement pour cette présentation.</p>
    </div>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BusFront style={{ color: 'white' }} />
          </div>
          TransUSTHB
        </div>
        
        <nav className="nav-menu">
          <a className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard className="w-5 h-5" /> Vue d'ensemble
          </a>
          <a className={`nav-item ${activeTab === 'etudiants' ? 'active' : ''}`} onClick={() => setActiveTab('etudiants')}>
            <Users className="w-5 h-5" /> Étudiants & Abonnements
          </a>
          <a className={`nav-item ${activeTab === 'lignes' ? 'active' : ''}`} onClick={() => setActiveTab('lignes')}>
            <Map className="w-5 h-5" /> Lignes & Stations
          </a>
          <a className={`nav-item ${activeTab === 'horaires' ? 'active' : ''}`} onClick={() => setActiveTab('horaires')}>
            <Clock className="w-5 h-5" /> Planification
          </a>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          <strong>Admin</strong>
          <div style={{ color: 'var(--text-muted)' }}>Session BDD 2025-2026</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'etudiants' && renderPlaceholder('Gestion des Étudiants')}
        {activeTab === 'lignes' && renderPlaceholder('Gestion des Lignes')}
        {activeTab === 'horaires' && renderPlaceholder('Gestion des Horaires')}
      </main>
    </div>
  );
}

export default App;
