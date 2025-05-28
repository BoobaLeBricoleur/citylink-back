const { pool } = require('../config/db');

class Announcement {
    static async findById(id) {
        const [rows] = await pool.query('SELECT a.*, u.firstname, u.lastname, u.email FROM Announcement a JOIN User u ON a.user_id = u.id WHERE a.id = ?', [id]);
        return rows[0];
    }

    static async getAll(limit = 100, offset = 0) {
        const [rows] = await pool.query(
            'SELECT a.id, a.title, a.content, a.publication_date, a.user_id, a.is_featured, a.is_active, u.firstname, u.lastname FROM Announcement a JOIN User u ON a.user_id = u.id ORDER BY a.publication_date DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows;
    }

    static async create(data) {
        const { title, content, user_id, is_featured = false, is_active = true } = data;
        const [result] = await pool.query(
            'INSERT INTO Announcement (title, content, user_id, is_featured, is_active) VALUES (?, ?, ?, ?, ?)',
            [title, content, user_id, is_featured, is_active]
        );
        return { id: result.insertId, title, content, user_id, is_featured, is_active };
    }

    static async update(id, data) {
        // Filtrer uniquement les champs autorisés
        const allowedData = {};
        const allowedFields = ['title', 'content', 'is_featured', 'is_active'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                allowedData[field] = data[field];
            }
        }

        if (Object.keys(allowedData).length === 0) return false;

        const [result] = await pool.query(
            'UPDATE Announcement SET ? WHERE id = ?',
            [allowedData, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Announcement WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Announcement;