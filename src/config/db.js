const mysql = require('mysql2/promise');

// Créer un pool de connexions pour une meilleure performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || '8c6e0l.h.filess.io',        // Nom du service dans docker-compose
  user: process.env.DB_USER || 'CityLink_reviewdesk',  // Utilisateur MySQL
  port: process.env.DB_PORT || 3307, // Port MySQL
  password: process.env.DB_PASSWORD || '34b1bafe54e503e24f0767ee7427718a601257a7', // Mot de passe MySQL
  database: process.env.DB_NAME || 'CityLink_reviewdesk', // Nom de la base de données
  waitForConnections: true,
  connectionLimit: 10,  // Nombre max de connexions simultanées
  queueLimit: 0
});

// Fonction utilitaire pour tester la connexion à la base de données
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données réussie');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Échec de connexion à la base de données:', error);
    return false;
  }
}

module.exports = { pool, testConnection };