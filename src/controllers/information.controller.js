const Information = require('../models/information.model');
const Tag = require('../models/tag.model');

exports.getAllInformations = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const withTags = req.query.withTags === 'true';

        let informations;
        if (withTags) {
            informations = await Information.getAllWithTags(limit);
        } else {
            informations = await Information.getAll(limit);
        }

        res.json(informations);
    } catch (error) {
        next(error);
    }
};

exports.getInformationById = async (req, res, next) => {
    try {
        const withTags = req.query.withTags === 'true';

        let information;
        if (withTags) {
            information = await Information.getInformationWithTags(req.params.id);
        } else {
            information = await Information.findById(req.params.id);
        }

        if (!information) {
            return res.status(404).json({ message: 'Information non trouvée' });
        }

        res.json(information);
    } catch (error) {
        next(error);
    }
};

exports.createInformation = async (req, res, next) => {
    try {
        const information = await Information.create(req.body);

        if (req.body.tags && Array.isArray(req.body.tags)) {
            for (const tagId of req.body.tags) {
                await Information.addTagToInformation(information.id, tagId);
            }
        }

        res.status(201).json({
            message: 'Information créée',
            information: await Information.getInformationWithTags(information.id)
        });
    } catch (error) {
        next(error);
    }
};

exports.updateInformation = async (req, res, next) => {
    try {
        const information = await Information.findById(req.params.id);
        if (!information) {
            return res.status(404).json({ message: 'Information non trouvée' });
        }

        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const updated = await Information.update(req.params.id, req.body);
        if (!updated) {
            return res.status(400).json({ message: 'Échec de mise à jour' });
        }

        res.json({
            message: 'Information mise à jour',
            information: await Information.getInformationWithTags(req.params.id)
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteInformation = async (req, res, next) => {
    try {
        const information = await Information.findById(req.params.id);
        if (!information) {
            return res.status(404).json({ message: 'Information non trouvée' });
        }

        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const deleted = await Information.delete(req.params.id);
        if (!deleted) {
            return res.status(400).json({ message: 'Échec de suppression' });
        }

        res.json({ message: 'Information supprimée' });
    } catch (error) {
        next(error);
    }
};

exports.addTagToInformation = async (req, res, next) => {
    try {
        const { informationId, tagId } = req.params;

        const information = await Information.findById(informationId);
        if (!information) {
            return res.status(404).json({ message: 'Information non trouvée' });
        }

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(404).json({ message: 'Tag non trouvé' });
        }

        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const result = await Information.addTagToInformation(informationId, tagId);
        if (!result) {
            return res.status(400).json({ message: 'Le tag est déjà associé à cette information' });
        }

        res.json({
            message: 'Tag ajouté à l\'information',
            information: await Information.getInformationWithTags(informationId)
        });
    } catch (error) {
        next(error);
    }
};

exports.removeTagFromInformation = async (req, res, next) => {
    try {
        const { informationId, tagId } = req.params;

        const information = await Information.findById(informationId);
        if (!information) {
            return res.status(404).json({ message: 'Information non trouvée' });
        }

        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(404).json({ message: 'Tag non trouvé' });
        }

        if (req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const result = await Information.removeTagFromInformation(informationId, tagId);
        if (!result) {
            return res.status(400).json({ message: 'Le tag n\'est pas associé à cette information' });
        }

        res.json({
            message: 'Tag retiré de l\'information',
            information: await Information.getInformationWithTags(informationId)
        });
    } catch (error) {
        next(error);
    }
};