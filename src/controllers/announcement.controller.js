const Announcement = require('../models/announcement.model');

exports.getAllAnnouncements = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const announcements = await Announcement.getAll(limit, offset);
        res.json(announcements);
    } catch (error) {
        next(error);
    }
};

exports.getAnnouncementById = async (req, res, next) => {
    try {
        const ann = await Announcement.findById(req.params.id);
        if (!ann) return res.status(404).json({ message: 'Annonce non trouvée' });
        res.json(ann);
    } catch (error) {
        next(error);
    }
};

exports.createAnnouncement = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { title, content } = req.body;
        const ann = await Announcement.create({ title, content, user_id });
        res.status(201).json({ message: 'Annonce créée', announcement: ann });
    } catch (error) {
        next(error);
    }
};

exports.updateAnnouncement = async (req, res, next) => {
    try {
        const ann = await Announcement.findById(req.params.id);
        if (!ann) return res.status(404).json({ message: 'Annonce non trouvée' });
        if (req.user.id !== ann.user_id && req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }
        const updated = await Announcement.update(req.params.id, req.body);
        if (!updated) return res.status(400).json({ message: 'Échec de mise à jour' });
        res.json({ message: 'Annonce mise à jour' });
    } catch (error) {
        next(error);
    }
};

exports.deleteAnnouncement = async (req, res, next) => {
    try {
        const ann = await Announcement.findById(req.params.id);
        if (!ann) return res.status(404).json({ message: 'Annonce non trouvée' });
        if (req.user.id !== ann.user_id && req.user.role_id !== 1) {
            return res.status(403).json({ message: 'Non autorisé' });
        }
        const deleted = await Announcement.delete(req.params.id);
        if (!deleted) return res.status(400).json({ message: 'Échec de suppression' });
        res.json({ message: 'Annonce supprimée' });
    } catch (error) {
        next(error);
    }
};