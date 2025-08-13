const Forum = require('../models/forum.model');
const ForumMessage = require('../models/forummessage.model');

exports.listForums = async (req, res, next) => {
  try {
    const forums = await Forum.getAll();
    res.json(forums);
  } catch (e) { next(e); }
};

exports.getForum = async (req, res, next) => {
  try {
    const forum = await Forum.getById(req.params.id);
    if (!forum) return res.status(404).json({ message: 'Forum introuvable' });
    res.json(forum);
  } catch (e) { next(e); }
};

exports.createForum = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || name.length > 150) {
      return res.status(400).json({ message: 'Nom requis (<=150)' });
    }

    // Limite: 1 forum / 24h
    const createdCount = await Forum.countForumsLast24h(req.user.id);
    if (createdCount >= 1) {
      return res.status(429).json({
        message: 'Limite atteinte: vous avez déjà créé un forum dans les dernières 24h.'
      });
    }

    const created = await Forum.create({
      name,
      description: description || '',
      user_id: req.user.id
    });
    res.status(201).json(created);
  } catch (e) { next(e); }
};

exports.deleteForum = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role_id === 1;
    const ok = await Forum.delete(req.params.id, req.user.id, isAdmin);
    if (!ok) return res.status(404).json({ message: 'Non supprimé' });
    res.json({ message: 'Supprimé' });
  } catch (e) { next(e); }
};

exports.listMessages = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const rows = await ForumMessage.getByForum(req.params.forumId, limit, offset);
    res.json(rows);
  } catch (e) { next(e); }
};

exports.createMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || message.length > 5000) {
      return res.status(400).json({ message: 'Message requis (<=5000)' });
    }

    // Limite: 1 message / 5 minutes
    const last = await ForumMessage.getLastMessageTimestamp(req.user.id);
    if (last) {
      const lastTs = new Date(last).getTime();
      const now = Date.now();
      const diffMs = now - lastTs;
      const fiveMinMs = 5 * 60 * 1000;
      if (diffMs < fiveMinMs) {
        const remainSec = Math.ceil((fiveMinMs - diffMs) / 1000);
        return res.status(429).json({
            message: `Veuillez patienter encore ${remainSec} secondes avant de poster un nouveau message.`
        });
      }
    }

    const created = await ForumMessage.create({
      forum_id: req.params.forumId,
      user_id: req.user.id,
      message
    });
    res.status(201).json(created);
  } catch (e) { next(e); }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role_id === 1;
    const ok = await ForumMessage.delete(req.params.messageId, req.user.id, isAdmin);
    if (!ok) return res.status(404).json({ message: 'Non supprimé' });
    res.json({ message: 'Supprimé' });
  } catch (e) { next(e); }
};