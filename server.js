require('dotenv').config(); // Charge les variables d'environnement de .env
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = 3000;

// Démarrage du serveur
async function startServer() {
  // Teste d'abord la connexion à la base de données
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📚 API accessible à l'adresse: http://localhost:${PORT}/api`);
  });
}

startServer();