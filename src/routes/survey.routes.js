const express = require('express');
const router = express.Router();
const controller = require('../controllers/survey.controller');
const {auth, adminAuth} = require('../middlewares/auth.middleware');

// Routes publiques
router.get('/', controller.getAllSurveys);         // GET /api/surveys
router.get('/:id', controller.getSurveyById);      // GET /api/surveys/:id

// Routes authentifiées
router.post('/', auth, controller.createSurvey);         // POST /api/surveys
router.put('/:id', auth, controller.updateSurvey);       // PUT /api/surveys/:id
router.delete('/:id', auth, controller.deleteSurvey);    // DELETE /api/surveys/:id
router.post('/:id/vote', auth, controller.vote);         // POST /api/surveys/:id/vote

module.exports = router;
