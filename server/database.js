const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'transport_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const initDb = async () => {
  try {
    // We first connect without the database to create it if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'transport_db';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConnection.end();

    const connection = await pool.getConnection();

    console.log("🔄 Initializing MySQL database...");

    // 0. UTILISATEURS (Admin & Manager)
    await connection.query(`CREATE TABLE IF NOT EXISTS UTILISATEUR (
      id_utilisateur INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      mot_de_passe VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      nom VARCHAR(100),
      prenom VARCHAR(100)
    )`);

    // 1. ETUDIANT
    await connection.query(`CREATE TABLE IF NOT EXISTS ETUDIANT (
      id_etudiant INT PRIMARY KEY AUTO_INCREMENT,
      matricule_etud VARCHAR(50) UNIQUE NOT NULL,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      email VARCHAR(255)
    )`);

    // 2. LIGNE
    await connection.query(`CREATE TABLE IF NOT EXISTS LIGNE (
      id_ligne INT PRIMARY KEY AUTO_INCREMENT,
      nom_ligne VARCHAR(100) NOT NULL,
      description TEXT,
      statut VARCHAR(50) DEFAULT 'active'
    )`);

    // 3. STATION
    await connection.query(`CREATE TABLE IF NOT EXISTS STATION (
      id_station INT PRIMARY KEY AUTO_INCREMENT,
      nom_station VARCHAR(100) NOT NULL,
      localisation VARCHAR(255)
    )`);

    // 4. BUS
    await connection.query(`CREATE TABLE IF NOT EXISTS BUS (
      id_bus INT PRIMARY KEY AUTO_INCREMENT,
      immatriculation VARCHAR(50) UNIQUE NOT NULL,
      modele VARCHAR(100) DEFAULT '',
      capacite_max INT NOT NULL,
      statut VARCHAR(50) DEFAULT 'active'
    )`);

    // 5. HORAIRE
    await connection.query(`CREATE TABLE IF NOT EXISTS HORAIRE (
      id_horaire INT PRIMARY KEY AUTO_INCREMENT,
      jour_semaine VARCHAR(50) NOT NULL,
      heure_depart VARCHAR(10) NOT NULL,
      heure_arrivee VARCHAR(10),
      id_ligne INT,
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne) ON DELETE CASCADE
    )`);

    // 6. ABONNEMENT
    await connection.query(`CREATE TABLE IF NOT EXISTS ABONNEMENT (
      id_abonnement INT PRIMARY KEY AUTO_INCREMENT,
      id_etudiant INT,
      id_ligne INT,
      date_debut DATE NOT NULL,
      date_fin DATE,
      UNIQUE KEY(id_etudiant, id_ligne, date_debut),
      FOREIGN KEY (id_etudiant) REFERENCES ETUDIANT(id_etudiant) ON DELETE CASCADE,
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne) ON DELETE CASCADE
    )`);

    // 7. DESSERVIR
    await connection.query(`CREATE TABLE IF NOT EXISTS DESSERVIR (
      id_ligne INT,
      id_station INT,
      ordre_passage INT NOT NULL,
      PRIMARY KEY (id_ligne, id_station),
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne) ON DELETE CASCADE,
      FOREIGN KEY (id_station) REFERENCES STATION(id_station) ON DELETE CASCADE
    )`);

    // 8. AFFECTATION_BUS
    await connection.query(`CREATE TABLE IF NOT EXISTS AFFECTATION_BUS (
      id_affectation INT PRIMARY KEY AUTO_INCREMENT,
      id_bus INT,
      id_ligne INT,
      date_debut DATE NOT NULL,
      date_fin DATE,
      UNIQUE KEY(id_bus, id_ligne, date_debut),
      FOREIGN KEY (id_bus) REFERENCES BUS(id_bus) ON DELETE CASCADE,
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne) ON DELETE CASCADE
    )`);

    // 9. TRAJET
    await connection.query(`CREATE TABLE IF NOT EXISTS TRAJET (
      id_trajet INT PRIMARY KEY AUTO_INCREMENT,
      date_trajet DATE NOT NULL,
      retard_minutes INT DEFAULT 0,
      statut VARCHAR(50) DEFAULT 'a_lheure',
      nb_passagers INT DEFAULT 0,
      id_bus INT,
      id_ligne INT,
      id_horaire INT,
      FOREIGN KEY (id_bus) REFERENCES BUS(id_bus) ON DELETE CASCADE,
      FOREIGN KEY (id_ligne) REFERENCES LIGNE(id_ligne) ON DELETE CASCADE,
      FOREIGN KEY (id_horaire) REFERENCES HORAIRE(id_horaire) ON DELETE CASCADE
    )`);

    // SEED DATA 
    const [rows] = await connection.query("SELECT COUNT(*) AS count FROM LIGNE");
    if (rows[0].count === 0) {
      console.log("🚌 Seeding USTHB transport data into MySQL...");

      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash('Admin@USTHB2026', salt);
      const managerHash = await bcrypt.hash('Manager@Trans26', salt);
      
      await connection.query("INSERT INTO UTILISATEUR (email, mot_de_passe, role, nom, prenom) VALUES (?, ?, ?, ?, ?)", 
        ['a.amrani@usthb.dz', adminHash, 'admin', 'Amrani', 'Amir']);
      await connection.query("INSERT INTO UTILISATEUR (email, mot_de_passe, role, nom, prenom) VALUES (?, ?, ?, ?, ?)", 
        ['n.ouali.manager@usthb.dz', managerHash, 'manager', 'Ouali', 'Nadia']);

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
      for (const l of lignes) {
        await connection.query("INSERT INTO LIGNE (nom_ligne, description, statut) VALUES (?, ?, ?)", l);
      }

      const stations = [
        ["USTHB Portail Principal", "Bab Ezzouar, Alger"], ["Cité Universitaire Est", "Cité 1er Novembre, Bab Ezzouar"],
        ["Technopole", "Technopole de Bab Ezzouar"], ["Hai Essalam", "Hai Essalam, Bab Ezzouar"],
        ["Cimetière El Alia", "Route nationale 5"], ["Stade Commune", "Bab Ezzouar centre"],
        ["Bab Ezzouar Métro", "Station métro Bab Ezzouar"], ["Oued Smar", "Zone Industrielle Oued Smar"],
        ["El Madania", "El Madania, Alger"], ["Belouizdad", "Rue Mohamed Belouizdad"],
        ["Kouba Centre", "Place du 1er Novembre, Kouba"], ["Bordj El Kiffan", "Centre Bordj El Kiffan"],
        ["Bachdjerrah", "Bachdjerrah Est"], ["Caroubier", "Le Caroubier, Alger"],
        ["Hussein Dey Gare", "Gare SNTF Hussein Dey"], ["Hai El Badr", "Cité Hai El Badr"],
        ["Hammamet", "Hammamet, El Harrach"], ["El Harrach Gare", "Gare SNTF El Harrach"],
        ["Les Annassers", "Les Annassers, El Harrach"], ["Bir Mourad Raïs", "Centre BMR"],
        ["Ben Aknoun", "Ben Aknoun, Alger"], ["Chéraga Centre", "Chéraga"],
        ["Dely Ibrahim Centre", "Centre Dely Ibrahim"], ["Saoula", "Saoula, Alger"],
        ["Birkhadem Centre", "Centre Birkhadem"], ["Ain Naadja", "Ain Naadja"],
        ["Les Eucalyptus", "Les Eucalyptus"], ["Rouiba Centre", "Rouiba"],
        ["Réghaïa", "Réghaïa"], ["Ain Taya Centre", "Ain Taya"], ["Draria Centre", "Draria"],
      ];
      for (const s of stations) {
        await connection.query("INSERT INTO STATION (nom_station, localisation) VALUES (?, ?)", s);
      }

      const buses = [
        ["16-BJ-1234", "Mercedes Sprinter 519", 72, "active"], ["16-BJ-0912", "Iveco Daily 70C", 72, "active"],
        ["16-BJ-1102", "Iveco Daily 70C", 72, "active"], ["16-BJ-0553", "Mercedes Sprinter 519", 72, "active"],
        ["16-BJ-0744", "Mercedes Sprinter 416", 60, "active"], ["16-BJ-1388", "Iveco Daily 70C", 72, "active"],
        ["16-BJ-0621", "Mercedes Sprinter 416", 60, "active"], ["16-BJ-1477", "Iveco Daily 70C", 72, "active"],
        ["16-BJ-0320", "Mercedes Sprinter 416", 60, "active"], ["16-BJ-0445", "Mercedes Sprinter 416", 60, "maintenance"],
        ["16-BJ-0987", "Mercedes Sprinter 519", 72, "active"], ["16-BJ-1599", "Iveco Daily 70C", 72, "active"],
        ["16-BJ-0200", "Mercedes Sprinter 416", 60, "inactive"],
      ];
      for (const b of buses) {
        await connection.query("INSERT INTO BUS (immatriculation, modele, capacite_max, statut) VALUES (?, ?, ?, ?)", b);
      }

      const noms = ["Benali", "Bouzid", "Mansouri", "Djemai", "Hadj-Ali", "Ouali", "Khelil", "Aouat", "Belkacem", "Meziane", "Amrani", "Saadi", "Cherif", "Hamdani", "Boukhalfa", "Larbi", "Touati", "Hamdi", "Yahia", "Ziani"];
      const prenoms = ["Khaled", "Amina", "Youcef", "Siham", "Raouf", "Nadia", "Sofiane", "Lynda", "Riadh", "Omar", "Amir", "Sara", "Mourad", "Fatima", "Karim", "Samia", "Bilal", "Meriem", "Amine", "Houda"];
      for (let i = 0; i < 100; i++) {
        const nom = noms[i % noms.length];
        const prenom = prenoms[i % prenoms.length];
        const mat = `22183${String(1000 + i).padStart(4, '0')}`;
const email = `${prenom.toLowerCase().charAt(0)}.${nom.toLowerCase()}${i > 19 ? i : ''}@etu.usthb.dz`;
        await connection.query("INSERT INTO ETUDIANT (matricule_etud, nom, prenom, email) VALUES (?, ?, ?, ?)", [mat, nom, prenom, email]);
      }

      for (let i = 1; i <= 90; i++) {
        const ligneId = ((i - 1) % 11) + 1; 
        const effectiveLigne = ligneId >= 9 ? ligneId + 1 : ligneId; 
        await connection.query("INSERT INTO ABONNEMENT (id_etudiant, id_ligne, date_debut) VALUES (?, ?, ?)", 
          [i, effectiveLigne > 12 ? 1 : effectiveLigne, '2025-09-05']);
      }

      await connection.query("UPDATE ABONNEMENT SET date_fin = '2025-11-01' WHERE id_etudiant = 1");
      await connection.query("INSERT INTO ABONNEMENT (id_etudiant, id_ligne, date_debut) VALUES (1, 2, '2025-11-02')");

      const desservir = [
        [1,1,1],[1,2,2],[1,3,3],[1,4,4],[1,5,5],[1,6,6],[1,7,7],
        [2,1,1],[2,8,2],[2,9,3],[2,10,4],[2,11,5],
        [3,1,1],[3,12,2],[3,13,3],[3,14,4],[3,15,5],
        [4,1,1],[4,8,2],[4,16,3],[4,17,4],[4,18,5],[4,19,6],
        [5,1,1],[5,11,2],[5,20,3],
        [6,1,1],[6,21,2],[6,22,3],[6,23,4],
        [7,1,1],[7,24,2],[7,25,3],
        [8,1,1],[8,26,2],[8,27,3],[8,13,4],
        [10,1,1],[10,28,2],[10,30,3],
        [11,1,1],[11,21,2],[11,22,3],
        [12,1,1],[12,24,2],[12,31,3],
      ];
      for (const d of desservir) {
        await connection.query("INSERT INTO DESSERVIR (id_ligne, id_station, ordre_passage) VALUES (?, ?, ?)", d);
      }

      const affectations = [
        [1,1,"2025-09-01"],[2,1,"2025-09-01"], [3,2,"2025-09-01"],[4,2,"2025-09-01"],
        [5,3,"2025-09-01"], [6,4,"2025-09-01"],[2,4,"2025-09-01"],
        [7,5,"2025-09-01"], [8,6,"2025-09-01"], [9,7,"2025-09-01"],
        [11,8,"2025-09-01"], [12,10,"2025-09-01"], [8,11,"2025-09-01"], [9,12,"2025-09-01"],
      ];
      for (const a of affectations) {
        await connection.query("INSERT INTO AFFECTATION_BUS (id_bus, id_ligne, date_debut) VALUES (?, ?, ?)", a);
      }

      const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi'];
      for (const j of jours) { await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '06:00', '06:45', 1]); await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '12:30', '13:15', 1]); }
      for (const j of jours) { await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '06:20', '07:10', 2]); }
      ['Dimanche','Lundi','Mardi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '06:45', '07:30', 3]));
      ['Dimanche','Lundi','Mercredi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '06:15', '07:00', 4]));
      ['Dimanche','Lundi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '07:10', '07:55', 5]));
      ['Dimanche','Lundi','Jeudi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '07:00', '07:50', 6]));
      ['Dimanche','Mercredi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '06:30', '07:15', 7]));
      ['Dimanche','Lundi','Mardi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '06:30', '07:20', 8]));
      ['Dimanche','Lundi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '07:15', '08:10', 10]));
      ['Dimanche','Mardi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '06:45', '07:35', 11]));
      ['Dimanche','Lundi'].forEach(async j => await connection.query("INSERT INTO HORAIRE (jour_semaine, heure_depart, heure_arrivee, id_ligne) VALUES (?, ?, ?, ?)", [j, '07:00', '07:45', 12]));

      const trajets = [
        ['2026-05-08', 0, 'a_lheure', 61, 1, 1, 1], ['2026-05-08', 25, 'en_retard', 58, 2, 4, 16],
        ['2026-05-08', 18, 'en_retard', 5, 3, 3, 13], ['2026-05-08', 0, 'a_lheure', 67, 4, 2, 11],
        ['2026-05-08', 0, 'a_lheure', 44, 5, 3, 13], ['2026-05-08', 0, 'annule', 0, 6, 6, 24],
        ['2026-05-08', 0, 'a_lheure', 38, 7, 5, 21], ['2026-05-08', 0, 'a_lheure', 51, 8, 10, 29],
        ['2026-05-07', 15, 'en_retard', 70, 1, 1, 1], ['2026-05-07', 0, 'a_lheure', 55, 3, 2, 11],
        ['2026-05-07', 0, 'a_lheure', 48, 5, 3, 13], ['2026-05-06', 0, 'a_lheure', 62, 1, 1, 3],
        ['2026-05-06', 10, 'en_retard', 65, 11, 8, 26],
      ];
      for (const t of trajets) {
        await connection.query("INSERT INTO TRAJET (date_trajet, retard_minutes, statut, nb_passagers, id_bus, id_ligne, id_horaire) VALUES (?, ?, ?, ?, ?, ?, ?)", t);
      }

      console.log("✅ Seed data inserted successfully.");
    }

    connection.release();
  } catch (err) {
    console.error("❌ Database initialization error:", err);
  }
};

initDb();

module.exports = pool;
