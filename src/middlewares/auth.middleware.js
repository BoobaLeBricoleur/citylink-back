const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Middleware d'authentification standard
const auth = async (req, res, next) => {
  try {
    // Récupère le token du header Authorization (format: "Bearer TOKEN")
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Vérifie si l'utilisateur existe toujours dans la base
    const [rows] = await pool.query('SELECT * FROM User WHERE id = ?', [decoded.id]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur inexistant' });
    }

    // Ajoute l'utilisateur et le token à l'objet request
    req.user = user;
    req.token = token;
    return next(); // Retourner next() pour éviter l'exécution du code suivant
  } catch (error) {
    return res.status(401).json({ message: 'Veuillez vous authentifier' });
  }
};

// Middleware d'authentification pour les administrateurs
const adminAuth = async (req, res, next) => {
  try {
    // On vérifie d'abord le token et on récupère l'utilisateur
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Vérifie si l'utilisateur existe toujours dans la base
    const [userRows] = await pool.query('SELECT * FROM User WHERE id = ?', [decoded.id]);
    const user = userRows[0];

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur inexistant' });
    }

    // Ajoute l'utilisateur à la requête
    req.user = user;
    req.token = token;
    
    // Vérifie si l'utilisateur a le rôle admin (id=1)
    const [rows] = await pool.query(
      'SELECT * FROM UserRole WHERE id = ? AND name = "admin"',
      [user.role_id]
    );
    
    if (rows.length === 0) {
      return res.status(403).json({ message: 'Accès interdit - Droits administrateur requis' });
    }
    
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Accès interdit' });
  }
};

// Middleware d'authentification pour les commerçants (business)
const businessAuth = async (req, res, next) => {
  try {
    // On vérifie d'abord le token et on récupère l'utilisateur
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Vérifie si l'utilisateur existe toujours dans la base
    const [userRows] = await pool.query('SELECT * FROM User WHERE id = ?', [decoded.id]);
    const user = userRows[0];

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur inexistant' });
    }

    // Ajoute l'utilisateur à la requête
    req.user = user;
    req.token = token;
    
    // Vérifie si l'utilisateur a le rôle admin (id=1) ou commerçant/business (id=3)
    const [rows] = await pool.query(
      'SELECT * FROM UserRole WHERE id = ? AND (name = "admin" OR name = "business")',
      [user.role_id]
    );
    
    if (rows.length === 0) {
      return res.status(403).json({ message: 'Accès interdit - Droits administrateur ou commerçant requis' });
    }
    
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Accès interdit' });
  }
};

// Middleware pour vérifier si un utilisateur est le propriétaire d'un business ou admin
const isBusinessOwnerOrAdmin = async (req, res, next) => {
  try {
    const businessId = req.params.id;
    
    if (!businessId) {
      return res.status(400).json({ message: 'ID de commerce non fourni' });
    }
    
    // Récupérer les informations du business
    const [businessRows] = await pool.query('SELECT * FROM Business WHERE id = ?', [businessId]);
    const business = businessRows[0];
    
    if (!business) {
      return res.status(404).json({ message: 'Commerce non trouvé' });
    }
    
    // Vérifier si l'utilisateur est le propriétaire ou un admin
    if (req.user.id === business.user_id || req.user.role_id === 1) {
      // Stocker le business dans la requête pour éviter de le récupérer à nouveau
      req.business = business;
      return next();
    }
    
    return res.status(403).json({ message: 'Non autorisé - Vous n\'êtes pas le propriétaire de ce commerce' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = { auth, adminAuth, businessAuth, isBusinessOwnerOrAdmin };