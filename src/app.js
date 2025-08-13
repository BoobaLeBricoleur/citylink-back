const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const announcementRoutes = require('./routes/announcement.routes');
const businessRoutes = require('./routes/business.routes');
const eventRoutes = require('./routes/event.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const eventRegistrationRoutes = require('./routes/eventregistration.routes');
const infornationRoutes = require('./routes/information.routes');
const tagRoutes = require('./routes/tag.routes');
const forumRoutes = require('./routes/forum.routes');
const surveyRoutes = require('./routes/survey.routes');

const app = express();

// Middlewares globaux
// Configuration CORS détaillée
app.use(cors({
  origin: '*', // Autorise toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // En-têtes autorisés
  credentials: true, // Autorise l'envoi de cookies
  maxAge: 86400 // Cache la pré-vérification pendant 24 heures
}));
app.options('*', cors()); // Pré-vérification CORS pour toutes les routes

app.use(express.json()); // Parse les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Parse les formulaires

// Page d'accueil de l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API CityLink' });
});

// Routes utilisateur
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/event-registrations', eventRegistrationRoutes);
app.use('/api/information', infornationRoutes);
app.use('/api/tags', tagRoutes)
app.use('/api/forums', forumRoutes);
app.use('/api/surveys', surveyRoutes);

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