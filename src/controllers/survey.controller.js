const Survey = require('../models/survey.model');

exports.getAllSurveys = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const surveys = await Survey.getAll(limit);
        res.json(surveys);
    } catch (error) {
        next(error);
    }
};

exports.getSurveyById = async (req, res, next) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) return res.status(404).json({message: 'Sondage non trouvé'});

        // Si l'utilisateur est connecté, vérifier s'il a déjà voté
        let userVote = null;
        if (req.user) {
            userVote = await Survey.getUserVote(req.params.id, req.user.id);
        }

        res.json({
            survey,
            userVote
        });
    } catch (error) {
        next(error);
    }
};

exports.createSurvey = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const {question, options} = req.body;

        // Validation: au moins deux options sont requises
        if (!options || options.length < 2) {
            return res.status(400).json({message: 'Un sondage doit avoir au moins deux options'});
        }

        const survey = await Survey.create({question, options, user_id});
        res.status(201).json({message: 'Sondage créé', survey});
    } catch (error) {
        next(error);
    }
};

exports.updateSurvey = async (req, res, next) => {
    try {
        const {question, options} = req.body;
        const survey = await Survey.findById(req.params.id);

        if (!survey) {
            return res.status(404).json({message: 'Sondage non trouvé'});
        }

        // Seul le créateur ou un admin peut modifier le sondage
        if (req.user.id !== survey.user_id && req.user.role_id !== 1) {
            return res.status(403).json({message: 'Non autorisé'});
        }

        // S'assurer qu'il y a au moins deux options si les options sont fournies
        if (options && options.length < 2) {
            return res.status(400).json({message: 'Un sondage doit avoir au moins deux options'});
        }

        const updated = await Survey.update(req.params.id, {question, options});
        if (!updated) {
            return res.status(400).json({message: 'Échec de mise à jour'});
        }

        res.json({message: 'Sondage mis à jour'});
    } catch (error) {
        next(error);
    }
};

exports.deleteSurvey = async (req, res, next) => {
    try {
        const survey = await Survey.findById(req.params.id);

        if (!survey) {
            return res.status(404).json({message: 'Sondage non trouvé'});
        }

        // Seul le créateur ou un admin peut supprimer le sondage
        if (req.user.id !== survey.user_id && req.user.role_id !== 1) {
            return res.status(403).json({message: 'Non autorisé'});
        }

        const deleted = await Survey.delete(req.params.id);
        if (!deleted) {
            return res.status(400).json({message: 'Échec de suppression'});
        }

        res.json({message: 'Sondage supprimé'});
    } catch (error) {
        next(error);
    }
};

exports.vote = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const survey_id = req.params.id;
        const {option_id} = req.body;

        if (!option_id) {
            return res.status(400).json({message: 'ID de l\'option requis'});
        }

        // Vérifier si le sondage existe
        const survey = await Survey.findById(survey_id);
        if (!survey) {
            return res.status(404).json({message: 'Sondage non trouvé'});
        }

        // Vérifier si l'option appartient bien à ce sondage
        const optionExists = survey.options.some(opt => opt.id === parseInt(option_id));
        if (!optionExists) {
            return res.status(400).json({message: 'Option invalide pour ce sondage'});
        }

        const result = await Survey.vote({survey_id, user_id, option_id});

        res.json({
            message: 'Vote enregistré avec succès',
            success: result
        });
    } catch (error) {
        next(error);
    }
};
