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
    const { 
      firstname, 
      lastname, 
      company, 
      email, 
      password, 
      address,
      postal_code,
      city,
      phone,
      birthday,
      mail_new_events,
      mail_events,
      public_profile,
      role_id 
    } = userData;
    
    // Hasher le mot de passe avant stockage
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const [result] = await pool.query(
        `INSERT INTO User (
          firstname, lastname, company, email, password, 
          address, postal_code, city, phone, birthday,
          mail_new_events, mail_events, public_profile, role_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firstname, 
          lastname, 
          company || null, 
          email, 
          hashedPassword, 
          address || null, 
          postal_code || null, 
          city || null, 
          phone || null,
          birthday || null,
          mail_new_events !== undefined ? mail_new_events : 0,
          mail_events !== undefined ? mail_events : 0,
          public_profile !== undefined ? public_profile : 0,
          role_id || 2
        ]
      );
  
      if (!result.insertId) {
        throw new Error("Échec de l'insertion de l'utilisateur dans la base de données.");
      }
  
      // Récupérer l'utilisateur complet pour le renvoyer
      const [user] = await pool.query('SELECT * FROM User WHERE id = ?', [result.insertId]);
  
      if (!user || user.length === 0) {
        throw new Error("Utilisateur créé mais impossible à récupérer.");
      }
  
      // Ne pas renvoyer le mot de passe
      const { password: _, ...userDataReturn } = user[0];
      
      return userDataReturn;
    } catch (error) {
      console.error("Erreur SQL lors de la création:", error);
      throw error;
    }
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