const EventRegistration = require('../models/eventregistration.model');

exports.getUserRegistrations = async (req, res, next) => {
    try {
        const registrations = await EventRegistration.getAllByUser(req.user.id);
        res.json(registrations);
    } catch (error) {
        next(error);
    }
};

exports.registerForEvent = async (req, res, next) => {
    try {
        const { event_id, reserved } = req.body;
        const registration = await EventRegistration.create({
            user_id: req.user.id,
            event_id,
            reserved
        });
        res.status(201).json(registration);
    } catch (error) {
        next(error);
    }
};

exports.updateRegistration = async (req, res, next) => {
    try {
        const updated = await EventRegistration.update(
            req.user.id,
            req.params.eventId,
            req.body
        );
        if (!updated) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }
        res.json({ message: 'Réservation mise à jour avec succès' });
    } catch (error) {
        next(error);
    }
};

exports.deleteRegistration = async (req, res, next) => {
    try {
        const deleted = await EventRegistration.delete(
            req.user.id,
            req.params.eventId
        );
        if (!deleted) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }
        res.json({ message: 'Réservation supprimée avec succès' });
    } catch (error) {
        next(error);
    }
};