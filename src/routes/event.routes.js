const express = require('express');
const router = express.Router();
const controller = require('../controllers/event.controller');
const { auth } = require('../middlewares/auth.middleware');

router.get('/', controller.getAllEvents);
router.get('/:id', auth, controller.getEventById);
router.post('/', auth, controller.createEvent);
router.put('/:id', auth, controller.updateEvent);
router.delete('/:id', auth, controller.deleteEvent);

module.exports = router;