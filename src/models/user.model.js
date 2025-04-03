const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Trouver un utilisateur par son ID
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM User WHERE id = ?', [id]);
    return rows[0]; // Retourne l'utilisateur ou undefined
  }

  // Trouver un utilisateur par son email
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    return rows[0];
  }

  // Créer un nouvel utilisateur
  static async create(userData) {
    const { firstname, lastname, company, email, password, role_id } = userData;
    // Hasher le mot de passe avant stockage
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO User (firstname, lastname, company, email, password, role_id) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, company || null, email, hashedPassword, role_id || 2] // role_id 2 = utilisateur standard
    );
    
    return { id: result.insertId, firstname, lastname, company, email, role_id };
  }

  // Mettre à jour un utilisateur
  static async update(id, userData) {
    const { firstname, lastname, company, email, role_id } = userData;
    
    const [result] = await pool.query(
      'UPDATE User SET firstname = ?, lastname = ?, company = ?, email = ?, role_id = ? WHERE id = ?',
      [firstname, lastname, company || null, email, role_id, id]
    );
    
    return result.affectedRows > 0; // Retourne true si l'utilisateur a été mis à jour
  }

  // Mettre à jour le mot de passe d'un utilisateur
  static async updatePassword(id, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query('UPDATE User SET password = ? WHERE id = ?', [hashedPassword, id]);
    
    return result.affectedRows > 0;
  }

  // Supprimer un utilisateur
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM User WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Récupérer tous les utilisateurs avec pagination
  static async getAll(limit = 100, offset = 0) {
    const [rows] = await pool.query(
      'SELECT id, firstname, lastname, company, email, role_id, created_at FROM User LIMIT ? OFFSET ?', 
      [limit, offset]
    );
    return rows;
  }

  // Récupérer tous les rôles utilisateur
  static async getUserRoles() {
    const [rows] = await pool.query('SELECT * FROM UserRole');
    return rows;
  }
}

module.exports = User;