const { pool } = require('../config/db');

class ForumMessage {
  static async getByForum(forum_id, limit = 100, offset = 0) {
    const [rows] = await pool.query(
      `SELECT m.*,
              TRIM(CONCAT(COALESCE(u.firstname,''), ' ', COALESCE(u.lastname,''))) AS author_name
       FROM ForumMessage m
       LEFT JOIN User u ON u.id = m.user_id
       WHERE m.forum_id = ?
       ORDER BY m.created_at ASC
       LIMIT ? OFFSET ?`,
      [forum_id, +limit, +offset]
    );
    return rows;
  }

  static async create({ forum_id, user_id, message }) {
    const [res] = await pool.query(
      `INSERT INTO ForumMessage (forum_id, user_id, message) VALUES (?,?,?)`,
      [forum_id, user_id, message]
    );
    const [rows] = await pool.query(
      `SELECT m.*,
              TRIM(CONCAT(COALESCE(u.firstname,''), ' ', COALESCE(u.lastname,''))) AS author_name
       FROM ForumMessage m
       LEFT JOIN User u ON u.id = m.user_id
       WHERE m.id = ?`,
      [res.insertId]
    );
    return rows[0];
  }

  static async delete(id, user_id, isAdmin = false) {
    const cond = isAdmin ? '' : ' AND user_id = ?';
    const params = isAdmin ? [id] : [id, user_id];
    const [res] = await pool.query(
      `DELETE FROM ForumMessage WHERE id = ?${cond}`,
      params
    );
    return res.affectedRows > 0;
  }

  static async getLastMessageTimestamp(user_id) {
    const [rows] = await pool.query(
      `SELECT created_at
       FROM ForumMessage
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [user_id]
    );
    return rows[0]?.created_at || null;
  }
}

module.exports = ForumMessage;