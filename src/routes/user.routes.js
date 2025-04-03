const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, adminAuth } = require('../middlewares/auth.middleware');

// Routes publiques (pas besoin d'authentification)
router.post('/register', userController.register);         // POST /api/users/register
router.post('/login', userController.login);               // POST /api/users/login

// Routes protégées (nécessite d'être connecté)
router.get('/profile', auth, userController.getProfile);   // GET /api/users/profile
router.post('/change-password', auth, userController.changePassword); // POST /api/users/change-password
router.get('/roles', auth, userController.getUserRoles);   // GET /api/users/roles

// Routes protégées (l'utilisateur ne peut modifier que ses propres informations)
router.get('/:id', auth, userController.getUserById);      // GET /api/users/:id
router.put('/:id', auth, userController.updateUser);       // PUT /api/users/:id
router.delete('/:id', auth, userController.deleteUser);    // DELETE /api/users/:id

// Routes admin uniquement
router.get('/', adminAuth, userController.getAllUsers);    // GET /api/users

module.exports = router;