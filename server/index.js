require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database'); // This is now a mysql2 connection pool

const app = express();

// Configure CORS for production/external access
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'uni-transport-super-secret-key-2026';

// ═══════════════════════════════════════════════════════════════
// Helper: promisify db calls
// ═══════════════════════════════════════════════════════════════
const dbAll = async (sql, params = []) => {
  const [rows] = await db.query(sql, params);
  return rows;
};

const dbGet = async (sql, params = []) => {
  const [rows] = await db.query(sql, params);
  return rows[0];
};

const dbRun = async (sql, params = []) => {
  const [result] = await db.query(sql, params);
  return { lastID: result.insertId, changes: result.affectedRows };
};

// ═══════════════════════════════════════════════════════════════
// 0. AUTHENTICATION — /api/auth
// ═══════════════════════════════════════════════════════════════
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check in UTILISATEUR table (Admin/Manager)
    const user = await dbGet('SELECT * FROM UTILISATEUR WHERE email = ?', [email]);
    
    if (user) {
      const valid = await bcrypt.compare(password, user.mot_de_passe);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      
      const token = jwt.sign({ id: user.id_utilisateur, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({
        token,
        user: { id: user.id_utilisateur, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom }
      });
    }

    // Check in ETUDIANT table
    const student = await dbGet('SELECT * FROM ETUDIANT WHERE email = ?', [email]);
    if (student) {
      if (password !== 'Student@2026!') return res.status(401).json({ error: 'Invalid credentials' });
      
      const token = jwt.sign({ id: student.id_etudiant, role: 'student' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({
        token,
        user: { id: student.id_etudiant, email: student.email, role: 'student', nom: student.nom, prenom: student.prenom, matricule: student.matricule_etud }
      });
    }

    return res.status(401).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════
// 1. DASHBOARD — /api/stats
// ═══════════════════════════════════════════════════════════════
app.get('/api/stats', async (req, res) => {
  try {
    const totalStudents = await dbGet(`SELECT COUNT(*) as count FROM ETUDIANT`);
    const subscribedStudents = await dbGet(
      `SELECT COUNT(DISTINCT id_etudiant) as count FROM ABONNEMENT WHERE date_fin IS NULL`
    );
    const unsubscribed = totalStudents.count - subscribedStudents.count;

    const totalBuses = await dbGet(`SELECT COUNT(*) as count FROM BUS WHERE statut = 'active'`);
    const maintenanceBuses = await dbGet(`SELECT COUNT(*) as count FROM BUS WHERE statut = 'maintenance'`);
    const inactiveBuses = await dbGet(`SELECT COUNT(*) as count FROM BUS WHERE statut = 'inactive'`);

    const totalLines = await dbGet(`SELECT COUNT(*) as count FROM LIGNE WHERE statut = 'active'`);
    const inactiveLines = await dbGet(`SELECT COUNT(*) as count FROM LIGNE WHERE statut = 'inactive'`);

    const studentsPerLine = await dbAll(`
      SELECT l.id_ligne, l.nom_ligne, COUNT(a.id_etudiant) as nombre_etudiants
      FROM LIGNE l
      LEFT JOIN ABONNEMENT a ON l.id_ligne = a.id_ligne AND a.date_fin IS NULL
      WHERE l.statut = 'active'
      GROUP BY l.id_ligne, l.nom_ligne
      ORDER BY nombre_etudiants DESC
    `);

    const fillRates = await dbAll(`
      SELECT 
        l.id_ligne, l.nom_ligne,
        COALESCE(a_stats.nb_etudiants, 0) as total_abonnes,
        COALESCE(b_stats.capacite_totale, 0) as capacite_flotte,
        CASE 
          WHEN COALESCE(b_stats.capacite_totale, 0) = 0 THEN 0
          ELSE ROUND((COALESCE(a_stats.nb_etudiants, 0) / b_stats.capacite_totale) * 100, 1)
        END as taux_remplissage
      FROM LIGNE l
      LEFT JOIN (
        SELECT id_ligne, COUNT(id_etudiant) as nb_etudiants 
        FROM ABONNEMENT WHERE date_fin IS NULL GROUP BY id_ligne
      ) a_stats ON l.id_ligne = a_stats.id_ligne
      LEFT JOIN (
        SELECT ab.id_ligne, SUM(b.capacite_max) as capacite_totale
        FROM AFFECTATION_BUS ab
        JOIN BUS b ON ab.id_bus = b.id_bus
        WHERE ab.date_fin IS NULL
        GROUP BY ab.id_ligne
      ) b_stats ON l.id_ligne = b_stats.id_ligne
      WHERE l.statut = 'active'
      ORDER BY taux_remplissage DESC
    `);

    const openIncidents = await dbGet(
      `SELECT COUNT(*) as count FROM TRAJET WHERE retard_minutes > 0 AND date_trajet = CURRENT_DATE`
    );

    const todaysTrips = await dbAll(`
      SELECT t.id_trajet, t.date_trajet, t.retard_minutes, t.statut, t.nb_passagers,
             l.nom_ligne, b.immatriculation, b.capacite_max,
             h.heure_depart, h.heure_arrivee
      FROM TRAJET t
      JOIN LIGNE l ON t.id_ligne = l.id_ligne
      JOIN BUS b ON t.id_bus = b.id_bus
      JOIN HORAIRE h ON t.id_horaire = h.id_horaire
      ORDER BY t.date_trajet DESC, h.heure_depart ASC
      LIMIT 20
    `);

    res.json({
      kpi: {
        totalStudents: totalStudents.count,
        subscribedStudents: subscribedStudents.count,
        unsubscribed,
        activeBuses: totalBuses.count,
        maintenanceBuses: maintenanceBuses.count,
        inactiveBuses: inactiveBuses.count,
        activeLines: totalLines.count,
        inactiveLines: inactiveLines.count,
        openIncidents: openIncidents.count,
      },
      studentsPerLine,
      fillRates,
      todaysTrips,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 2. ÉTUDIANTS — /api/etudiants
// ═══════════════════════════════════════════════════════════════
app.get('/api/etudiants', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT e.*, l.nom_ligne as ligne_actuelle, a.id_ligne
      FROM ETUDIANT e
      LEFT JOIN ABONNEMENT a ON e.id_etudiant = a.id_etudiant AND a.date_fin IS NULL
      LEFT JOIN LIGNE l ON a.id_ligne = l.id_ligne
      ORDER BY e.nom, e.prenom
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/etudiants', async (req, res) => {
  try {
    const { matricule_etud, nom, prenom, email, id_ligne } = req.body;
    
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      const [result] = await connection.query(
        `INSERT INTO ETUDIANT (matricule_etud, nom, prenom, email) VALUES (?, ?, ?, ?)`,
        [matricule_etud, nom, prenom, email]
      );
      const id_etudiant = result.insertId;

      if (id_ligne) {
        await connection.query(
          `INSERT INTO ABONNEMENT (id_etudiant, id_ligne, date_debut) VALUES (?, ?, CURRENT_DATE)`,
          [id_etudiant, id_ligne]
        );
      }
      
      await connection.commit();
      res.status(201).json({ id_etudiant });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/etudiants/:id', async (req, res) => {
  try {
    const { matricule_etud, nom, prenom, email, id_ligne, is_active } = req.body;
    const id_etudiant = req.params.id;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(
        `UPDATE ETUDIANT SET matricule_etud = ?, nom = ?, prenom = ?, email = ? WHERE id_etudiant = ?`,
        [matricule_etud, nom, prenom, email, id_etudiant]
      );

      const [subRows] = await connection.query(
        `SELECT * FROM ABONNEMENT WHERE id_etudiant = ? AND date_fin IS NULL`,
        [id_etudiant]
      );
      const currentSub = subRows[0];

      if (is_active === false) {
        if (currentSub) {
          await connection.query(
            `UPDATE ABONNEMENT SET date_fin = CURRENT_DATE WHERE id_abonnement = ?`,
            [currentSub.id_abonnement]
          );
        }
      } else if (id_ligne) {
        if (!currentSub || currentSub.id_ligne !== parseInt(id_ligne)) {
          if (currentSub) {
            await connection.query(
              `UPDATE ABONNEMENT SET date_fin = CURRENT_DATE WHERE id_abonnement = ?`,
              [currentSub.id_abonnement]
            );
          }
          await connection.query(
            `INSERT INTO ABONNEMENT (id_etudiant, id_ligne, date_debut) VALUES (?, ?, CURRENT_DATE)`,
            [id_etudiant, id_ligne]
          );
        }
      }

      await connection.commit();
      res.json({ success: true });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/etudiants/:id', async (req, res) => {
  try {
    await dbRun(`DELETE FROM ETUDIANT WHERE id_etudiant = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/etudiants/:id/historique', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT l.nom_ligne, a.date_debut, a.date_fin,
        CASE WHEN a.date_fin IS NULL THEN 'Actif' ELSE 'Terminé' END as statut
      FROM ABONNEMENT a
      JOIN LIGNE l ON a.id_ligne = l.id_ligne
      WHERE a.id_etudiant = ?
      ORDER BY a.date_debut DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 3. LIGNES — /api/lignes
// ═══════════════════════════════════════════════════════════════
app.get('/api/lignes', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT l.*,
        COALESCE(s_count.cnt, 0) as nb_stations,
        COALESCE(b_count.cnt, 0) as nb_bus,
        COALESCE(a_count.cnt, 0) as nb_etudiants,
        COALESCE(fill.taux, 0) as taux_remplissage
      FROM LIGNE l
      LEFT JOIN (SELECT id_ligne, COUNT(*) as cnt FROM DESSERVIR GROUP BY id_ligne) s_count ON l.id_ligne = s_count.id_ligne
      LEFT JOIN (SELECT id_ligne, COUNT(*) as cnt FROM AFFECTATION_BUS WHERE date_fin IS NULL GROUP BY id_ligne) b_count ON l.id_ligne = b_count.id_ligne
      LEFT JOIN (SELECT id_ligne, COUNT(*) as cnt FROM ABONNEMENT WHERE date_fin IS NULL GROUP BY id_ligne) a_count ON l.id_ligne = a_count.id_ligne
      LEFT JOIN (
        SELECT l2.id_ligne,
          CASE WHEN COALESCE(SUM(b2.capacite_max), 0) = 0 THEN 0
          ELSE ROUND(COALESCE(ac.cnt, 0) / SUM(b2.capacite_max) * 100, 1) END as taux
        FROM LIGNE l2
        LEFT JOIN AFFECTATION_BUS ab2 ON l2.id_ligne = ab2.id_ligne AND ab2.date_fin IS NULL
        LEFT JOIN BUS b2 ON ab2.id_bus = b2.id_bus
        LEFT JOIN (SELECT id_ligne, COUNT(*) as cnt FROM ABONNEMENT WHERE date_fin IS NULL GROUP BY id_ligne) ac ON l2.id_ligne = ac.id_ligne
        GROUP BY l2.id_ligne
      ) fill ON l.id_ligne = fill.id_ligne
      ORDER BY l.id_ligne
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lignes', async (req, res) => {
  try {
    const { nom_ligne, description, statut } = req.body;
    const result = await dbRun(
      `INSERT INTO LIGNE (nom_ligne, description, statut) VALUES (?, ?, ?)`,
      [nom_ligne, description, statut || 'active']
    );
    res.status(201).json({ id_ligne: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lignes/:id', async (req, res) => {
  try {
    const { nom_ligne, description, statut } = req.body;
    await dbRun(
      `UPDATE LIGNE SET nom_ligne = ?, description = ?, statut = ? WHERE id_ligne = ?`,
      [nom_ligne, description, statut, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lignes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const ligne = await dbGet('SELECT * FROM LIGNE WHERE id_ligne = ?', [id]);
    if (!ligne) return res.status(404).json({ error: 'Ligne non trouvée' });

    const stations = await dbAll(`
      SELECT s.*, d.ordre_passage
      FROM STATION s
      JOIN DESSERVIR d ON s.id_station = d.id_station
      WHERE d.id_ligne = ?
      ORDER BY d.ordre_passage
    `, [id]);

    const horaires = await dbAll('SELECT * FROM HORAIRE WHERE id_ligne = ? ORDER BY jour_semaine, heure_depart', [id]);

    const buses = await dbAll(`
      SELECT b.*, ab.date_debut, ab.date_fin
      FROM BUS b
      JOIN AFFECTATION_BUS ab ON b.id_bus = ab.id_bus
      WHERE ab.id_ligne = ? AND ab.date_fin IS NULL
    `, [id]);

    const etudiants = await dbAll(`
      SELECT e.*, a.date_debut
      FROM ETUDIANT e
      JOIN ABONNEMENT a ON e.id_etudiant = a.id_etudiant
      WHERE a.id_ligne = ? AND a.date_fin IS NULL
      ORDER BY e.nom, e.prenom
    `, [id]);

    res.json({ ...ligne, stations, horaires, buses, etudiants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 4. BUS — /api/bus
// ═══════════════════════════════════════════════════════════════
app.get('/api/bus', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT b.*, l.nom_ligne as ligne_actuelle
      FROM BUS b
      LEFT JOIN AFFECTATION_BUS ab ON b.id_bus = ab.id_bus AND ab.date_fin IS NULL
      LEFT JOIN LIGNE l ON ab.id_ligne = l.id_ligne
      ORDER BY b.immatriculation
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bus', async (req, res) => {
  try {
    const { immatriculation, modele, capacite_max, statut } = req.body;
    const result = await dbRun(
      `INSERT INTO BUS (immatriculation, modele, capacite_max, statut) VALUES (?, ?, ?, ?)`,
      [immatriculation, modele, capacite_max, statut || 'active']
    );
    res.status(201).json({ id_bus: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bus/:id', async (req, res) => {
  try {
    const { immatriculation, modele, capacite_max, statut } = req.body;
    await dbRun(
      `UPDATE BUS SET immatriculation = ?, modele = ?, capacite_max = ?, statut = ? WHERE id_bus = ?`,
      [immatriculation, modele, capacite_max, statut, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 5. INCIDENTS (Trajets en retard) — /api/incidents
// ═══════════════════════════════════════════════════════════════
app.get('/api/incidents', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT t.id_trajet, t.date_trajet, t.retard_minutes, t.statut, t.nb_passagers,
             l.nom_ligne, b.immatriculation, b.capacite_max,
             h.heure_depart, h.heure_arrivee
      FROM TRAJET t
      JOIN LIGNE l ON t.id_ligne = l.id_ligne
      JOIN BUS b ON t.id_bus = b.id_bus
      JOIN HORAIRE h ON t.id_horaire = h.id_horaire
      WHERE t.retard_minutes > 0 OR t.statut = 'annule'
      ORDER BY t.date_trajet DESC, t.retard_minutes DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 6. TRAJETS — /api/trajets
// ═══════════════════════════════════════════════════════════════
app.get('/api/trajets', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT t.*, l.nom_ligne, b.immatriculation, b.capacite_max,
             h.heure_depart, h.heure_arrivee, h.jour_semaine
      FROM TRAJET t
      JOIN LIGNE l ON t.id_ligne = l.id_ligne
      JOIN BUS b ON t.id_bus = b.id_bus
      JOIN HORAIRE h ON t.id_horaire = h.id_horaire
      ORDER BY t.date_trajet DESC, h.heure_depart ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 7. STATIONS — /api/stations
// ═══════════════════════════════════════════════════════════════
app.get('/api/stations', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT s.*, COUNT(d.id_ligne) as nb_lignes
      FROM STATION s
      LEFT JOIN DESSERVIR d ON s.id_station = d.id_station
      GROUP BY s.id_station
      ORDER BY s.nom_station
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 8. HORAIRES — /api/horaires
// ═══════════════════════════════════════════════════════════════
app.get('/api/horaires', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT h.*, l.nom_ligne
      FROM HORAIRE h
      JOIN LIGNE l ON h.id_ligne = l.id_ligne
      ORDER BY l.nom_ligne, 
        CASE h.jour_semaine
          WHEN 'Dimanche' THEN 1 WHEN 'Lundi' THEN 2 WHEN 'Mardi' THEN 3
          WHEN 'Mercredi' THEN 4 WHEN 'Jeudi' THEN 5
        END, h.heure_depart
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚌 UniTransport API is running on port ${PORT}`);
});
