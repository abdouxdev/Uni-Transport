const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// 1. Dashboard Stats
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  db.all(`
    SELECT l.nom_ligne, COUNT(a.id_etudiant) as nombre_etudiants
    FROM LIGNE l
    LEFT JOIN ABONNEMENT a ON l.id_ligne = a.id_ligne AND a.date_fin IS NULL
    GROUP BY l.id_ligne, l.nom_ligne
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.studentsPerLine = rows;

    db.all(`
      SELECT 
        l.nom_ligne,
        COALESCE(a_stats.nb_etudiants, 0) as total_abonnes,
        COALESCE(b_stats.capacite_totale, 0) as capacite_flotte,
        CASE 
            WHEN COALESCE(b_stats.capacite_totale, 0) = 0 THEN 0
            ELSE ROUND((CAST(COALESCE(a_stats.nb_etudiants, 0) AS FLOAT) / b_stats.capacite_totale) * 100, 2)
        END as taux_remplissage
      FROM LIGNE l
      LEFT JOIN (SELECT id_ligne, COUNT(id_etudiant) as nb_etudiants FROM ABONNEMENT WHERE date_fin IS NULL GROUP BY id_ligne) a_stats ON l.id_ligne = a_stats.id_ligne
      LEFT JOIN (SELECT ab.id_ligne, SUM(b.capacite_max) as capacite_totale FROM AFFECTATION_BUS ab JOIN BUS b ON ab.id_bus = b.id_bus WHERE ab.date_fin IS NULL GROUP BY ab.id_ligne) b_stats ON l.id_ligne = b_stats.id_ligne
    `, (err, rows2) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.fillRates = rows2;
      res.json(stats);
    });
  });
});

// 2. Etudiants
app.get('/api/etudiants', (req, res) => {
  db.all(`
    SELECT e.*, l.nom_ligne as ligne_actuelle
    FROM ETUDIANT e
    LEFT JOIN ABONNEMENT a ON e.id_etudiant = a.id_etudiant AND a.date_fin IS NULL
    LEFT JOIN LIGNE l ON a.id_ligne = l.id_ligne
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 3. Trajets avec retard
app.get('/api/incidents', (req, res) => {
  db.all(`
    SELECT t.date_trajet, l.nom_ligne, b.immatriculation, h.heure_depart, t.retard_minutes, t.statut
    FROM TRAJET t
    JOIN LIGNE l ON t.id_ligne = l.id_ligne
    JOIN BUS b ON t.id_bus = b.id_bus
    JOIN HORAIRE h ON t.id_horaire = h.id_horaire
    WHERE t.retard_minutes > 0
    ORDER BY t.date_trajet DESC, t.retard_minutes DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 4. Lignes
app.get('/api/lignes', (req, res) => {
  db.all('SELECT * FROM LIGNE', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
