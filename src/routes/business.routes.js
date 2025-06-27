const express = require('express');
const router = express.Router();
const controller = require('../controllers/business.controller');
const { auth, adminAuth } = require('../middlewares/auth.middleware');

router.get('/', controller.getAllBusinesses);         // GET /api/business
router.get('/categories', auth, controller.getAllCategories); // GET /api/business/categories
router.get('/:id', auth, controller.getBusinessById);      // GET /api/business/:id
router.post('/', auth, controller.createBusiness);         // POST /api/business
router.put('/:id', auth, controller.updateBusiness);       // PUT /api/business/:id
router.delete('/:id', auth, controller.deleteBusiness);    // DELETE /api/business/:id

module.exports = router;