const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');

const app = express();

// Middlewares globaux
app.use(cors()); // Permet les requêtes cross-origin
app.use(express.json()); // Parse les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Parse les formulaires

// Page d'accueil de l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API CityLink' });
});

// Routes utilisateur
app.use('/api/users', userRoutes);

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });

});

// Afficher toutes les routes enregistrées
console.log('=== ROUTES DISPONIBLES ===');
const listEndpoints = require('express-list-endpoints');
console.log(listEndpoints(app));
console.log('========================');

module.exports = app;