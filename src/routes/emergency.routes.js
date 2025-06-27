const express = require('express');
const router = express.Router();
const controller = require('../controllers/emergency.controller');
const { auth } = require('../middlewares/auth.middleware');

router.get('/', controller.getAllEmergencies); //GET /api/emergency
router.get('/:id', auth, controller.getEmergencyById); //GET /api/emergency/:id
router.post('/', auth, controller.createEmergency); //POST /api/emergency
router.put('/:id', auth, controller.updateEmergency); //PUT /api/emergency/:id
router.delete('/:id', auth, controller.deleteEmergency); //DELETE /api/emergency/:id

module.exports = router;