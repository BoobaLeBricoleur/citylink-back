const express = require('express');
const router = express.Router();
const controller = require('../controllers/forum.controller');
const { auth } = require('../middlewares/auth.middleware');

// Forums
router.get('/', controller.listForums);
router.get('/:id', controller.getForum);
router.post('/', auth, controller.createForum);
router.delete('/:id', auth, controller.deleteForum);

// Messages
router.get('/:forumId/messages', controller.listMessages);
router.post('/:forumId/messages', auth, controller.createMessage);
router.delete('/:forumId/messages/:messageId', auth, controller.deleteMessage);

module.exports = router;