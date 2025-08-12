const express = require('express');
const router = express.Router();
const controller = require('../controllers/tag.controller');
const { auth } = require('../middlewares/auth.middleware');

router.get('/', controller.getAllTags);                       // GET /api/tags
router.get('/:id', controller.getTagById);                    // GET /api/tags/:id
router.post('/', auth, controller.createTag);                 // POST /api/tags
router.put('/:id', auth, controller.updateTag);               // PUT /api/tags/:id
router.delete('/:id', auth, controller.deleteTag);            // DELETE /api/tags/:id
router.get('/:id/informations', controller.getInformationsByTag); // GET /api/tags/:id/informations

module.exports = router;