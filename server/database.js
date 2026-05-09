const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Enable WAL mode - foreign keys OFF during seed, ON after
db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA foreign_keys = OFF');

const initDb = () => {
  db.serialize(() => {
    // ═══════════════════════════════════════════════════════════
    // 1. ETUDIANT
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS ETUDIANT (
      id_etudiant INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule_etud TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT
    )`);

    // ═══════════════════════════════════════════════════════════
    // 2. LIGNE
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS LIGNE (
      id_ligne INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_ligne TEXT NOT NULL,
      description TEXT DEFAULT '',
      statut TEXT DEFAULT 'active'
    )`);

    // ═══════════════════════════════════════════════════════════
    // 3. STATION
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS STATION (
      id_station INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_station TEXT NOT NULL,
      localisation TEXT
    )`);

    // ═══════════════════════════════════════════════════════════
    // 4. BUS
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS BUS (
      id_bus INTEGER PRIMARY KEY AUTOINCREMENT,
      immatriculation TEXT UNIQUE NOT NULL,
      modele TEXT DEFAULT '',
      capacite_max INTEGER NOT NULL,
      statut TEXT DEFAULT 'active'
    )`);

    // ═══════════════════════════════════════════════════════════
    // 5. HORAIRE
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS HORAIRE (
      id_horaire INTEGER PRIMARY KEY AUTOINCREMENT,
      jour_semaine TEXT NOT NULL,
      heure_depart TEXT NOT NULL,
      heure_arrivee TEXT,
      id_ligne INTEGER,
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne)
    )`);

    // ═══════════════════════════════════════════════════════════
    // 6. ABONNEMENT
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS ABONNEMENT (
      id_etudiant INTEGER,
      id_ligne INTEGER,
      date_debut TEXT NOT NULL,
      date_fin TEXT,
      PRIMARY KEY (id_etudiant, id_ligne, date_debut),
      FOREIGN KEY (id_etudiant) REFERENCES ETUDIANT(id_etudiant),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne)
    )`);

    // ═══════════════════════════════════════════════════════════
    // 7. DESSERVIR
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS DESSERVIR (
      id_ligne INTEGER,
      id_station INTEGER,
      ordre_passage INTEGER NOT NULL,
      PRIMARY KEY (id_ligne, id_station),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne),
      FOREIGN KEY (id_station) REFERENCES STATION(id_station)
    )`);

    // ═══════════════════════════════════════════════════════════
    // 8. AFFECTATION_BUS
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS AFFECTATION_BUS (
      id_bus INTEGER,
      id_ligne INTEGER,
      date_debut TEXT NOT NULL,
      date_fin TEXT,
      PRIMARY KEY (id_bus, id_ligne, date_debut),
      FOREIGN KEY (id_bus) REFERENCES BUS(id_bus),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne)
    )`);

    // ═══════════════════════════════════════════════════════════
    // 9. TRAJET
    // ═══════════════════════════════════════════════════════════
    db.run(`CREATE TABLE IF NOT EXISTS TRAJET (
      id_trajet INTEGER PRIMARY KEY AUTOINCREMENT,
      date_trajet TEXT NOT NULL,
      retard_minutes INTEGER DEFAULT 0,
      statut TEXT DEFAULT 'a_lheure',
      nb_passagers INTEGER DEFAULT 0,
      id_bus INTEGER,
      id_ligne INTEGER,
      id_horaire INTEGER,
      FOREIGN KEY (id_bus) REFERENCES BUS(id_bus),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne),
      FOREIGN KEY (id_horaire) REFERENCES HORAIRE(id_horaire)
    )`);

    // ═══════════════════════════════════════════════════════════
    // SEED DATA — Realistic USTHB transport data
    // ═══════════════════════════════════════════════════════════
    db.get("SELECT COUNT(*) AS count FROM LIGNE", (err, row) => {
      if (row && row.count === 0) {
        console.log("🚌 Seeding USTHB transport data...");

        // ── Lignes ──────────────────────────────────────────────
        const lignes = [
          ["L1 — Bab Ezzouar", "Route depuis l'USTHB vers la station de métro Bab Ezzouar via Cité Universitaire", "active"],
          ["L2 — Kouba", "Route reliant l'USTHB au quartier de Kouba via El Madania", "active"],
          ["L3 — Hussein Dey", "Ligne express vers Hussein Dey avec arrêts limités", "active"],
          ["L4 — El Harrach", "Route vers El Harrach via la RN5 avec arrêts aux quartiers résidentiels", "active"],
          ["L5 — Bir Mourad Raïs", "Route sud reliant l'USTHB à la commune de Bir Mourad Raïs", "active"],
          ["L6 — Dely Ibrahim", "Route ouest vers Dely Ibrahim via Chéraga", "active"],
          ["L7 — Birkhadem", "Route vers Birkhadem via Saoula", "active"],
          ["L8 — Bachdjerrah", "Route vers Bachdjerrah et environs", "active"],
          ["L9 — Réghaïa", "Ligne est vers la zone côtière de Réghaïa", "inactive"],
          ["L10 — Ain Taya", "Route côtière est vers Ain Taya", "active"],
          ["L11 — Chéraga", "Route ouest via Ben Aknoun", "active"],
          ["L12 — Draria", "Route sud-ouest vers Draria", "active"],
        ];
        const stmtLigne = db.prepare("INSERT INTO LIGNE (nom_ligne, description, statut) VALUES (?, ?, ?)");
        lignes.forEach(l => stmtLigne.run(...l));
        stmtLigne.finalize();

        // ── Stations ────────────────────────────────────────────
        const stations = [
          ["USTHB Portail Principal", "Bab Ezzouar, Alger"],
          ["Cité Universitaire Est", "Cité 1er Novembre, Bab Ezzouar"],
          ["Technopole", "Technopole de Bab Ezzouar"],
          ["Hai Essalam", "Hai Essalam, Bab Ezzouar"],
          ["Cimetière El Alia", "Route nationale 5"],
          ["Stade Commune", "Bab Ezzouar centre"],
          ["Bab Ezzouar Métro", "Station métro Bab Ezzouar"],
          ["Oued Smar", "Zone Industrielle Oued Smar"],
          ["El Madania", "El Madania, Alger"],
          ["Belouizdad", "Rue Mohamed Belouizdad"],
          ["Kouba Centre", "Place du 1er Novembre, Kouba"],
          ["Bordj El Kiffan", "Centre Bordj El Kiffan"],
          ["Bachdjerrah", "Bachdjerrah Est"],
          ["Caroubier", "Le Caroubier, Alger"],
          ["Hussein Dey Gare", "Gare SNTF Hussein Dey"],
          ["Hai El Badr", "Cité Hai El Badr"],
          ["Hammamet", "Hammamet, El Harrach"],
          ["El Harrach Gare", "Gare SNTF El Harrach"],
          ["Les Annassers", "Les Annassers, El Harrach"],
          ["Bir Mourad Raïs", "Centre BMR"],
          ["Ben Aknoun", "Ben Aknoun, Alger"],
          ["Chéraga Centre", "Chéraga"],
          ["Dely Ibrahim Centre", "Centre Dely Ibrahim"],
          ["Saoula", "Saoula, Alger"],
          ["Birkhadem Centre", "Centre Birkhadem"],
          ["Ain Naadja", "Ain Naadja"],
          ["Les Eucalyptus", "Les Eucalyptus"],
          ["Rouiba Centre", "Rouiba"],
          ["Réghaïa", "Réghaïa"],
          ["Ain Taya Centre", "Ain Taya"],
          ["Draria Centre", "Draria"],
        ];
        const stmtStation = db.prepare("INSERT INTO STATION (nom_station, localisation) VALUES (?, ?)");
        stations.forEach(s => stmtStation.run(...s));
        stmtStation.finalize();

        // ── Bus ─────────────────────────────────────────────────
        const buses = [
          ["16-BJ-1234", "Mercedes Sprinter 519", 72, "active"],
          ["16-BJ-0912", "Iveco Daily 70C", 72, "active"],
          ["16-BJ-1102", "Iveco Daily 70C", 72, "active"],
          ["16-BJ-0553", "Mercedes Sprinter 519", 72, "active"],
          ["16-BJ-0744", "Mercedes Sprinter 416", 60, "active"],
          ["16-BJ-1388", "Iveco Daily 70C", 72, "active"],
          ["16-BJ-0621", "Mercedes Sprinter 416", 60, "active"],
          ["16-BJ-1477", "Iveco Daily 70C", 72, "active"],
          ["16-BJ-0320", "Mercedes Sprinter 416", 60, "active"],
          ["16-BJ-0445", "Mercedes Sprinter 416", 60, "maintenance"],
          ["16-BJ-0987", "Mercedes Sprinter 519", 72, "active"],
          ["16-BJ-1599", "Iveco Daily 70C", 72, "active"],
          ["16-BJ-0200", "Mercedes Sprinter 416", 60, "inactive"],
        ];
        const stmtBus = db.prepare("INSERT INTO BUS (immatriculation, modele, capacite_max, statut) VALUES (?, ?, ?, ?)");
        buses.forEach(b => stmtBus.run(...b));
        stmtBus.finalize();

        // ── Étudiants (100 étudiants réalistes) ─────────────────
        const noms = ["Benali", "Bouzid", "Mansouri", "Djemai", "Hadj-Ali", "Ouali", "Khelil", "Aouat", "Belkacem", "Meziane", "Amrani", "Saadi", "Cherif", "Hamdani", "Boukhalfa", "Larbi", "Touati", "Hamdi", "Yahia", "Ziani"];
        const prenoms = ["Khaled", "Amina", "Youcef", "Siham", "Raouf", "Nadia", "Sofiane", "Lynda", "Riadh", "Omar", "Amir", "Sara", "Mourad", "Fatima", "Karim", "Samia", "Bilal", "Meriem", "Amine", "Houda"];
        const stmtEtud = db.prepare("INSERT INTO ETUDIANT (matricule_etud, nom, prenom, email) VALUES (?, ?, ?, ?)");
        for (let i = 0; i < 100; i++) {
          const nom = noms[i % noms.length];
          const prenom = prenoms[i % prenoms.length];
          const mat = `22183${String(1000 + i).padStart(4, '0')}`;
          const email = `${prenom.toLowerCase().charAt(0)}.${nom.toLowerCase()}${i > 19 ? i : ''}@etu.usthb.dz`;
          stmtEtud.run(mat, nom, prenom, email);
        }
        stmtEtud.finalize();

        // ── Abonnements (distribuer ~90 étudiants sur les lignes actives) ──
        const stmtAbo = db.prepare("INSERT INTO ABONNEMENT (id_etudiant, id_ligne, date_debut) VALUES (?, ?, ?)");
        for (let i = 1; i <= 90; i++) {
          const ligneId = ((i - 1) % 11) + 1; // lines 1-11 (skip inactive L9=9)
          const effectiveLigne = ligneId >= 9 ? ligneId + 1 : ligneId; // skip line 9
          stmtAbo.run(i, effectiveLigne > 12 ? 1 : effectiveLigne, '2025-09-05');
        }
        stmtAbo.finalize();

        // ── Historique d'un changement de ligne (étudiant 1) ──
        db.run(`UPDATE ABONNEMENT SET date_fin = '2025-11-01' WHERE id_etudiant = 1`);
        db.run(`INSERT INTO ABONNEMENT (id_etudiant, id_ligne, date_debut) VALUES (1, 2, '2025-11-02')`);

        // ── Desservir (stations par ligne) ──
        const desservir = [
          // L1 — Bab Ezzouar
          [1,1,1],[1,2,2],[1,3,3],[1,4,4],[1,5,5],[1,6,6],[1,7,7],
          // L2 — Kouba
          [2,1,1],[2,8,2],[2,9,3],[2,10,4],[2,11,5],
          // L3 — Hussein Dey
          [3,1,1],[3,12,2],[3,13,3],[3,14,4],[3,15,5],
          // L4 — El Harrach
          [4,1,1],[4,8,2],[4,16,3],[4,17,4],[4,18,5],[4,19,6],
          // L5 — Bir Mourad Raïs
          [5,1,1],[5,11,2],[5,20,3],
          // L6 — Dely Ibrahim
          [6,1,1],[6,21,2],[6,22,3],[6,23,4],
          // L7 — Birkhadem
          [7,1,1],[7,24,2],[7,25,3],
          // L8 — Bachdjerrah
          [8,1,1],[8,26,2],[8,27,3],[8,13,4],
          // L10 — Ain Taya
          [10,1,1],[10,28,2],[10,30,3],
          // L11 — Chéraga
          [11,1,1],[11,21,2],[11,22,3],
          // L12 — Draria
          [12,1,1],[12,24,2],[12,31,3],
        ];
        const stmtDess = db.prepare("INSERT INTO DESSERVIR (id_ligne, id_station, ordre_passage) VALUES (?, ?, ?)");
        desservir.forEach(d => stmtDess.run(...d));
        stmtDess.finalize();

        // ── Affectation Bus ─────────────────────────────────────
        const affectations = [
          [1,1,"2025-09-01"],[2,1,"2025-09-01"],
          [3,2,"2025-09-01"],[4,2,"2025-09-01"],
          [5,3,"2025-09-01"],
          [6,4,"2025-09-01"],[2,4,"2025-09-01"],
          [7,5,"2025-09-01"],
          [8,6,"2025-09-01"],
          [9,7,"2025-09-01"],
          [11,8,"2025-09-01"],
          [12,10,"2025-09-01"],
          [8,11,"2025-09-01"],
          [9,12,"2025-09-01"],
        ];
        const stmtAff = db.prepare("INSERT INTO AFFECTATION_BUS (id_bus, id_ligne, date_debut) VALUES (?, ?, ?)");
        affectations.forEach(a => stmtAff.run(...a));
        stmtAff.finalize();

        // ── Horaires ────────────────────────────────────────────
        const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi'];
        const stmtHor = db.prepare("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)");
        // L1
        jours.forEach(j => { stmtHor.run(j, '06:00', '06:45', 1); stmtHor.run(j, '12:30', '13:15', 1); });
        // L2
        jours.forEach(j => stmtHor.run(j, '06:20', '07:10', 2));
        // L3
        ['Dimanche','Lundi','Mardi'].forEach(j => stmtHor.run(j, '06:45', '07:30', 3));
        // L4
        ['Dimanche','Lundi','Mercredi'].forEach(j => stmtHor.run(j, '06:15', '07:00', 4));
        // L5
        ['Dimanche','Lundi'].forEach(j => stmtHor.run(j, '07:10', '07:55', 5));
        // L6
        ['Dimanche','Lundi','Jeudi'].forEach(j => stmtHor.run(j, '07:00', '07:50', 6));
        // L7
        ['Dimanche','Mercredi'].forEach(j => stmtHor.run(j, '06:30', '07:15', 7));
        // L8
        ['Dimanche','Lundi','Mardi'].forEach(j => stmtHor.run(j, '06:30', '07:20', 8));
        // L10
        ['Dimanche','Lundi'].forEach(j => stmtHor.run(j, '07:15', '08:10', 10));
        // L11
        ['Dimanche','Mardi'].forEach(j => stmtHor.run(j, '06:45', '07:35', 11));
        // L12
        ['Dimanche','Lundi'].forEach(j => stmtHor.run(j, '07:00', '07:45', 12));
        stmtHor.finalize();

        // ── Trajets (avec retards et statuts variés) ────────────
        const trajets = [
          ['2026-05-08', 0, 'a_lheure', 61, 1, 1, 1],
          ['2026-05-08', 25, 'en_retard', 58, 2, 4, 16],
          ['2026-05-08', 18, 'en_retard', 5, 3, 3, 13],
          ['2026-05-08', 0, 'a_lheure', 67, 4, 2, 11],
          ['2026-05-08', 0, 'a_lheure', 44, 5, 3, 13],
          ['2026-05-08', 0, 'annule', 0, 6, 6, 24],
          ['2026-05-08', 0, 'a_lheure', 38, 7, 5, 21],
          ['2026-05-08', 0, 'a_lheure', 51, 8, 10, 29],
          ['2026-05-07', 15, 'en_retard', 70, 1, 1, 1],
          ['2026-05-07', 0, 'a_lheure', 55, 3, 2, 11],
          ['2026-05-07', 0, 'a_lheure', 48, 5, 3, 13],
          ['2026-05-06', 0, 'a_lheure', 62, 1, 1, 3],
          ['2026-05-06', 10, 'en_retard', 65, 11, 8, 26],
        ];
        const stmtTraj = db.prepare("INSERT INTO TRAJET (date_trajet, retard_minutes, statut, nb_passagers, id_bus, id_ligne, id_horaire) VALUES (?, ?, ?, ?, ?, ?, ?)");
        trajets.forEach(t => stmtTraj.run(...t));
        stmtTraj.finalize();

        console.log("✅ Seed data inserted successfully.");
      }
    });
  });
};

initDb();

module.exports = db;
