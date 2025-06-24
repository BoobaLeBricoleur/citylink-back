const { pool } = require('../config/db');

class Emergency {
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT e.*, u.firstname, u.lastname FROM Emergency e JOIN User u ON e.user_id = u.id WHERE e.id = ?', 
            [id]
        );
        return rows[0];
    }

    static async getAll(limit = 100) {
        const [rows] = await pool.query(
            'SELECT e.*, u.firstname, u.lastname FROM Emergency e JOIN User u ON e.user_id = u.id ORDER BY e.report_date DESC LIMIT ?',
            [limit]
        );
        return rows;
    }

    static async create(data) {
        try {
            const { emergency_type, description, user_id } = data;
            const report_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            const [result] = await pool.query(
                'INSERT INTO Emergency (emergency_type, description, user_id, report_date) VALUES (?, ?, ?, ?)',
                [emergency_type, description, user_id, report_date]
            );

            return { id: result.insertId, ...data, report_date };
        } catch (error) {
            throw new Error('Impossible de créer le signalement d\'urgence');
        }
    }

    static async update(id, data) {
        const [result] = await pool.query(
            'UPDATE Emergency SET ? WHERE id = ?',
            [data, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Emergency WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Emergency;