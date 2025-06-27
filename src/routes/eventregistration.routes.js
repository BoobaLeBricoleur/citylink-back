const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventregistration.controller');
const { auth } = require('../middlewares/auth.middleware');

router.get('/user', controller.getUserRegistrations);
router.post('/', auth, controller.registerForEvent);
router.put('/:eventId', auth, controller.updateRegistration);
router.delete('/:eventId', auth, controller.deleteRegistration);

module.exports = router;