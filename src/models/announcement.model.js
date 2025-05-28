const { pool } = require('../config/db');

class Announcement {
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM Announcement WHERE id = ?', [id]);
        return rows[0];
    }

    static async getAll(limit = 100, offset = 0) {
        const [rows] = await pool.query(
            'SELECT a.id, a.title, a.content, a.publication_date, a.user_id, u.firstname, u.lastname FROM Announcement a JOIN User u ON a.user_id = u.id ORDER BY a.publication_date DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows;
    }

    static async create(data) {
        const { title, content, user_id } = data;
        const [result] = await pool.query(
            'INSERT INTO Announcement (title, content, user_id) VALUES (?, ?, ?)',
            [title, content, user_id]
        );
        return { id: result.insertId, title, content, user_id };
    }

    static async update(id, data) {
        const { title, content } = data;
        const [result] = await pool.query(
            'UPDATE Announcement SET title = ?, content = ? WHERE id = ?',
            [title, content, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Announcement WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Announcement;