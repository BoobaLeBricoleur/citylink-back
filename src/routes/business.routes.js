const express = require('express');
const router = express.Router();
const controller = require('../controllers/business.controller');
const { auth, adminAuth, businessAuth, isBusinessOwnerOrAdmin } = require('../middlewares/auth.middleware');

// Routes publiques
router.get('/', controller.getAllBusinesses);         // GET /api/business - Liste tous les commerces
router.get('/:id', controller.getBusinessById);      // GET /api/business/:id - Détails d'un commerce

// Routes authentifiées
router.get('/categories', auth, controller.getAllCategories); // GET /api/business/categories - Liste toutes les catégories

// Routes commerçant & admin
router.get('/user/my-businesses', businessAuth, controller.getMyBusinesses); // GET /api/business/user/my-businesses - Mes commerces
router.post('/', businessAuth, controller.createBusiness);         // POST /api/business - Créer un commerce (admin & commerçant)

// Routes avec vérification de propriété
router.put('/:id', auth, isBusinessOwnerOrAdmin, controller.updateBusiness);       // PUT /api/business/:id - Modifier un commerce
router.delete('/:id', auth, isBusinessOwnerOrAdmin, controller.deleteBusiness);    // DELETE /api/business/:id - Supprimer un commerce

module.exports = router;