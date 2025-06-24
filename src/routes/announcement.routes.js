// src/routes/announcement.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/announcement.controller');
const { auth, adminAuth } = require('../middlewares/auth.middleware');

router.get('/', controller.getAllAnnouncements);            // GET /api/announcements
router.get('/:id', auth, controller.getAnnouncementById);         // GET /api/announcements/:id
router.post('/', auth, controller.createAnnouncement);            // POST /api/announcements
router.put('/:id', auth, controller.updateAnnouncement);          // PUT /api/announcements/:id
router.delete('/:id', auth, controller.deleteAnnouncement);       // DELETE /api/announcements/:id

module.exports = router;