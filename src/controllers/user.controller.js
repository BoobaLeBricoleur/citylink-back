const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res, next) => {
  try {
    const { 
      firstname, 
      lastname, 
      company, 
      email, 
      password,
      address,
      postal_code,
      city,
      phone,
      birthday,
      mail_new_events = true,
      mail_events = true,
      public_profile = false
    } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Créer l'utilisateur avec tous les nouveaux champs
    const user = await User.create({
      firstname,
      lastname,
      company,
      email,
      password,
      address,
      postal_code,
      city,
      phone,
      birthday,
      mail_new_events,
      mail_events,
      public_profile,
      role_id: 2 // Rôle utilisateur par défaut
    });
    
    // Générer le token JWT pour connexion automatique
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        company: user.company,
        address: user.address,
        postal_code: user.postal_code,
        city: user.city,
        phone: user.phone,
        avatar: user.avatar,
        mail_new_events: user.mail_new_events,
        mail_events: user.mail_events,
        public_profile: user.public_profile,
        role_id: user.role_id
      },
      token
    });
  } catch (error) {
    next(error); // Passe l'erreur au middleware de gestion d'erreurs
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    // Renvoyer toutes les informations utilisateur sauf mot de passe
    const { password: pwd, ...userData } = user;
    
    res.json({
      user: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer un utilisateur par son ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Ne pas renvoyer le mot de passe
    const { password, ...userData } = user;
    
    res.json(userData);
  } catch (error) {
    next(error);
  }
};

// Récupérer tous les utilisateurs avec pagination
exports.getAllUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const users = await User.getAll(limit, offset);
    res.json(users);
  } catch (error) {
    next(error);
  }
};


// Mettre à jour un utilisateur
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Vérifier si c'est l'utilisateur lui-même ou un admin
    if (req.user.id.toString() !== userId.toString() && req.user.role_id !== 1) {
      return res.status(403).json({ message: 'Non autorisé à modifier cet utilisateur' });
    }
    
    const { 
      firstname, 
      lastname, 
      company, 
      email, 
      address,
      postal_code,
      city,
      phone,
      birthday,
      mail_new_events,
      mail_events,
      public_profile,
      avatar,
      role_id 
    } = req.body;
    
    // Préparer les données à mettre à jour
    const updateData = {
      firstname,
      lastname,
      company,
      email,
      address,
      postal_code,
      city,
      phone,
      birthday,
      mail_new_events,
      mail_events,
      public_profile,
      avatar
    };
    
    // Seul admin peut changer le rôle
    if (req.user.role_id === 1 && role_id) {
      updateData.role_id = role_id;
    }
    
    const updated = await User.update(userId, updateData);
    
    if (!updated) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findById(userId);
    const { password, ...userData } = updatedUser;
    
    res.json({ 
      message: 'Utilisateur mis à jour avec succès',
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Vérifier l'ancien mot de passe
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }
    
    await User.updatePassword(userId, newPassword);
    
    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    next(error);
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Seul l'utilisateur lui-même ou un admin peut supprimer le compte
    if (req.user.id.toString() !== userId.toString() && req.user.role_id !== 1) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cet utilisateur' });
    }
    
    const deleted = await User.delete(userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

// Récupérer les rôles utilisateur
exports.getUserRoles = async (req, res, next) => {
  try {
    const roles = await User.getUserRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// Récupérer le profil de l'utilisateur connecté
exports.getProfile = async (req, res, next) => {
  try {
    // req.user est défini par le middleware auth
    const { password, ...userData } = req.user;
    res.json(userData);
  } catch (error) {
    next(error);
  }
};