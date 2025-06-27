const Emergency = require('../models/emergency.model');

exports.getAllEmergencies = async (req, res, next) => {
    try {
        const emergencies = await Emergency.getAll();
        res.json(emergencies);
    } catch (error) {
        next(error);
    }
};

exports.getEmergencyById = async (req, res, next) => {
    try {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) {
            return res.status(404).json({ message: 'Urgence non trouvée' });
        }
        res.json(emergency);
    } catch (error) {
        next(error);
    }
};

exports.createEmergency = async (req, res, next) => {
    console.log('Creating emergency with data:', req.body);
    try {
        const emergency = await Emergency.create({
            ...req.body,
            user_id: req.user.id
        });
        res.status(201).json({ 
            message: 'Signalement d\'urgence créé avec succès',
            emergency 
        });
    } catch (error) {
        next(error);
    }
};

exports.updateEmergency = async (req, res, next) => {
    try {
        const updated = await Emergency.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Urgence non trouvée' });
        }
        res.json({ message: 'Signalement mis à jour avec succès' });
    } catch (error) {
        next(error);
    }
};

exports.deleteEmergency = async (req, res, next) => {
    try {
        const deleted = await Emergency.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Urgence non trouvée' });
        }
        res.json({ message: 'Signalement supprimé avec succès' });
    } catch (error) {
        next(error);
    }
};