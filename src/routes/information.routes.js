const express = require('express');
const router = express.Router();
const controller = require('../controllers/information.controller');
const { auth, adminAuth } = require('../middlewares/auth.middleware');

router.get('/', controller.getAllInformations);                    // GET /api/information
router.get('/:id', controller.getInformationById);                 // GET /api/information/:id
router.post('/', auth, adminAuth, controller.createInformation);   // POST /api/information
router.put('/:id', auth, controller.updateInformation);            // PUT /api/information/:id
router.delete('/:id', auth, controller.deleteInformation);         // DELETE /api/information/:id

// Routes pour la gestion des tags liés aux informations
router.post('/:informationId/tags/:tagId', auth, controller.addTagToInformation);
router.delete('/:informationId/tags/:tagId', auth, controller.removeTagFromInformation);

module.exports = router;