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

module.exports = { auth, adminAuth };