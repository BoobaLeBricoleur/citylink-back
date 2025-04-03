module.exports = {
  auth: (req, res, next) => {
    // Simuler un utilisateur authentifié
    req.user = { id: 1, role_id: 2 };
    next();
  },
  adminAuth: (req, res, next) => {
    // Simuler un admin authentifié
    req.user = { id: 99, role_id: 1 };
    next();
  }
};