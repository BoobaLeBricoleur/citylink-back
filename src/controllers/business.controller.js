const Business = require('../models/business.model');

exports.getAllBusinesses = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const businesses = await Business.getAll(limit);
        res.json(businesses);
    } catch (error) {
        next(error);
    }
};

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Business.getAllCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

exports.getBusinessById = async (req, res, next) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Commerce non trouvé' });
        res.json(business);
    } catch (error) {
        next(error);
    }
};

exports.createBusiness = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const business = await Business.create({ ...req.body, user_id });
        res.status(201).json({ message: 'Commerce créé', business });
    } catch (error) {
        next(error);
    }
};

exports.updateBusiness = async (req, res, next) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Commerce non trouvé' });
        if (req.user.id !== business.user_id && req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }
        const updated = await Business.update(req.params.id, req.body);
        if (!updated) return res.status(400).json({ message: 'Échec de mise à jour' });
        res.json({ message: 'Commerce mis à jour' });
    } catch (error) {
        next(error);
    }
};

exports.deleteBusiness = async (req, res, next) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Commerce non trouvé' });
        if (req.user.id !== business.user_id && req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }
        const deleted = await Business.delete(req.params.id);
        if (!deleted) return res.status(400).json({ message: 'Échec de suppression' });
        res.json({ message: 'Commerce supprimé' });
    } catch (error) {
        next(error);
    }
};