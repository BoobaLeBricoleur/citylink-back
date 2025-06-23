const Event = require('../models/event.model');

exports.getAllEvents = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const events = await Event.getAll(limit);
        res.json(events);
    } catch (error) {
        next(error);
    }
};

exports.getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Événement non trouvé' });
        res.json(event);
    } catch (error) {
        next(error);
    }
};

exports.createEvent = async (req, res, next) => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json({ message: 'Événement créé', event });
    } catch (error) {
        next(error);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Événement non trouvé' });
        const updated = await Event.update(req.params.id, req.body);
        if (!updated) return res.status(400).json({ message: 'Échec de mise à jour' });
        res.json({ message: 'Événement mis à jour' });
    } catch (error) {
        next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Événement non trouvé' });
        const deleted = await Event.delete(req.params.id);
        if (!deleted) return res.status(400).json({ message: 'Échec de suppression' });
        res.json({ message: 'Événement supprimé' });
    } catch (error) {
        next(error);
    }
};