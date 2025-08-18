const { pool } = require('../config/db');

class Forum {
  static async getAll() {
    const [rows] = await pool.query(
      `SELECT f.*,
              TRIM(CONCAT(COALESCE(u.firstname,''), ' ', COALESCE(u.lastname,''))) AS owner_name
       FROM Forum f
       LEFT JOIN User u ON u.id = f.user_id
       ORDER BY f.created_at DESC`
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT f.*,
              TRIM(CONCAT(COALESCE(u.firstname,''), ' ', COALESCE(u.lastname,''))) AS owner_name
       FROM Forum f
       LEFT JOIN User u ON u.id = f.user_id
       WHERE f.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create({ name, description, user_id }) {
    const [res] = await pool.query(
      `INSERT INTO Forum (name, description, user_id) VALUES (?,?,?)`,
      [name, description, user_id]
    );
    return this.getById(res.insertId);
  }

  static async delete(id, user_id, isAdmin = false) {
    const cond = isAdmin ? '' : ' AND user_id = ?';
    const params = isAdmin ? [id] : [id, user_id];
    const [res] = await pool.query(
      `DELETE FROM Forum WHERE id = ?${cond}`,
      params
    );
    return res.affectedRows > 0;
  }

  static async countForumsLast24h(user_id) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM Forum
       WHERE user_id = ? AND created_at >= (NOW() - INTERVAL 1 DAY)`,
      [user_id]
    );
    return rows[0].cnt;
  }
}

module.exports = Forum;