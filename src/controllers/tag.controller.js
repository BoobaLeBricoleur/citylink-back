const Tag = require('../models/tag.model');

exports.getAllTags = async (req, res, next) => {
    try {
        const tags = await Tag.getAll();
        res.json(tags);
    } catch (error) {
        next(error);
    }
};

exports.getTagById = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag non trouvé' });
        }
        res.json(tag);
    } catch (error) {
        next(error);
    }
};

exports.createTag = async (req, res, next) => {
    try {
        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const tag = await Tag.create(req.body);
        res.status(201).json({ message: 'Tag créé', tag });
    } catch (error) {
        if (error.message === 'Un tag avec ce nom existe déjà') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

exports.updateTag = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag non trouvé' });
        }

        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const updated = await Tag.update(req.params.id, req.body);
        if (!updated) {
            return res.status(400).json({ message: 'Échec de mise à jour' });
        }

        res.json({ message: 'Tag mis à jour', tag: await Tag.findById(req.params.id) });
    } catch (error) {
        if (error.message === 'Un tag avec ce nom existe déjà') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

exports.deleteTag = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag non trouvé' });
        }

        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const deleted = await Tag.delete(req.params.id);
        if (!deleted) {
            return res.status(400).json({ message: 'Échec de suppression' });
        }

        res.json({ message: 'Tag supprimé' });
    } catch (error) {
        next(error);
    }
};

exports.getInformationsByTag = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag non trouvé' });
        }

        const informations = await Tag.getInformationsByTagId(req.params.id);
        res.json(informations);
    } catch (error) {
        next(error);
    }
};