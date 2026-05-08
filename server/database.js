const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // 1. Etudiants
    db.run(`CREATE TABLE IF NOT EXISTS ETUDIANT (
      id_etudiant INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule_etud TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT
    )`);

    // 2. Lignes
    db.run(`CREATE TABLE IF NOT EXISTS LIGNE (
      id_ligne INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_ligne TEXT NOT NULL
    )`);

    // 3. Stations
    db.run(`CREATE TABLE IF NOT EXISTS STATION (
      id_station INTEGER PRIMARY KEY AUTOINCREMENT,
      nom_station TEXT NOT NULL,
      localisation TEXT
    )`);

    // 4. Bus
    db.run(`CREATE TABLE IF NOT EXISTS BUS (
      id_bus INTEGER PRIMARY KEY AUTOINCREMENT,
      immatriculation TEXT UNIQUE NOT NULL,
      capacite_max INTEGER NOT NULL
    )`);

    // 5. Horaires
    db.run(`CREATE TABLE IF NOT EXISTS HORAIRE (
      id_horaire INTEGER PRIMARY KEY AUTOINCREMENT,
      jour_semaine TEXT NOT NULL,
      heure_depart TEXT NOT NULL,
      id_ligne INTEGER,
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne)
    )`);

    // 6. Abonnements
    db.run(`CREATE TABLE IF NOT EXISTS ABONNEMENT (
      id_etudiant INTEGER,
      id_ligne INTEGER,
      date_debut TEXT NOT NULL,
      date_fin TEXT,
      PRIMARY KEY (id_etudiant, id_ligne, date_debut),
      FOREIGN KEY (id_etudiant) REFERENCES ETUDIANT(id_etudiant),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne)
    )`);

    // 7. Desservir
    db.run(`CREATE TABLE IF NOT EXISTS DESSERVIR (
      id_ligne INTEGER,
      id_station INTEGER,
      ordre_passage INTEGER NOT NULL,
      PRIMARY KEY (id_ligne, id_station),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne),
      FOREIGN KEY (id_station) REFERENCES STATION(id_station)
    )`);

    // 8. Affectation Bus
    db.run(`CREATE TABLE IF NOT EXISTS AFFECTATION_BUS (
      id_bus INTEGER,
      id_ligne INTEGER,
      date_debut TEXT NOT NULL,
      date_fin TEXT,
      PRIMARY KEY (id_bus, id_ligne, date_debut),
      FOREIGN KEY (id_bus) REFERENCES BUS(id_bus),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne)
    )`);

    // 9. Trajet
    db.run(`CREATE TABLE IF NOT EXISTS TRAJET (
      id_trajet INTEGER PRIMARY KEY AUTOINCREMENT,
      date_trajet TEXT NOT NULL,
      retard_minutes INTEGER DEFAULT 0,
      statut TEXT,
      id_bus INTEGER,
      id_ligne INTEGER,
      id_horaire INTEGER,
      FOREIGN KEY (id_bus) REFERENCES BUS(id_bus),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne),
      FOREIGN KEY (id_horaire) REFERENCES HORAIRE(id_horaire)
    )`);

    // Seed Data
    db.get("SELECT COUNT(*) AS count FROM LIGNE", (err, row) => {
      if (row && row.count === 0) {
        console.log("Seeding initial data...");
        // Insert Lignes
        db.run(`INSERT INTO LIGNE (nom_ligne) VALUES ('Ligne 1 - Bab Ezzouar'), ('Ligne 2 - Alger Centre'), ('Ligne 3 - Boumerdes')`);
        
        // Insert Stations
        db.run(`INSERT INTO STATION (nom_station) VALUES ('Gare Agha'), ('Tafourah'), ('1er Mai'), ('USTHB'), ('Boumerdes Centre')`);
        
        // Insert Bus
        db.run(`INSERT INTO BUS (immatriculation, capacite_max) VALUES ('11223-115-16', 50), ('44556-115-16', 55), ('77889-115-35', 60)`);
        
        // Insert Etudiants
        for (let i = 1; i <= 20; i++) {
          db.run(`INSERT INTO ETUDIANT (matricule_etud, nom, prenom, email) VALUES ('202500${i}', 'Nom${i}', 'Prenom${i}', 'etud${i}@usthb.dz')`);
        }
        
        // Insert Abonnements
        for (let i = 1; i <= 15; i++) {
          const ligneId = (i % 3) + 1;
          db.run(`INSERT INTO ABONNEMENT (id_etudiant, id_ligne, date_debut) VALUES (${i}, ${ligneId}, '2025-09-01')`);
        }

        // Insert Affectations Bus
        db.run(`INSERT INTO AFFECTATION_BUS (id_bus, id_ligne, date_debut) VALUES (1, 1, '2025-09-01'), (2, 2, '2025-09-01'), (3, 3, '2025-09-01')`);
        
        // Horaires
        db.run(`INSERT INTO HORAIRE (jour_semaine, heure_depart, id_ligne) VALUES ('Dimanche', '07:30', 1), ('Lundi', '07:30', 1), ('Dimanche', '07:00', 2)`);

        // Trajets avec retards
        db.run(`INSERT INTO TRAJET (date_trajet, retard_minutes, statut, id_bus, id_ligne, id_horaire) VALUES ('2025-10-15', 15, 'En retard', 1, 1, 1), ('2025-10-15', 0, 'A l''heure', 2, 2, 3)`);
      }
    });
  });
};

initDb();

module.exports = db;
