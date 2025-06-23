require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = 3000;

// Version modifiée qui gère les erreurs
async function startServer() {
  try {
    console.log("Initialisation du serveur...");
    // Teste la connexion à la base de données
    await testConnection();
    console.log("✅ Connexion à la base de données réussie");
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📚 API accessible à l'adresse: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ ERREUR lors du démarrage:", error.message);
    console.error(error.stack);
  }
}

// Attraper les rejets de promesse non gérés
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejet de promesse non géré:', reason);
});

startServer();