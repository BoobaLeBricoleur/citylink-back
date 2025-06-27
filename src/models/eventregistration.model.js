const { pool } = require('../config/db');

class EventRegistration {
    static async findByUserAndEvent(userId, eventId) {
        const [rows] = await pool.query(
            'SELECT * FROM EventRegistration WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );
        return rows[0];
    }

    static async getAllByUser(userId) {
        const [rows] = await pool.query(
            `SELECT er.*, e.name as event_name, e.event_date, e.description 
             FROM EventRegistration er 
             JOIN Event e ON er.event_id = e.id 
             WHERE er.user_id = ?`,
            [userId]
        );
        return rows;
    }

    static async create(data) {
        try {
            const { user_id, event_id, reserved } = data;
            const [result] = await pool.query(
                'INSERT INTO EventRegistration (user_id, event_id, reserved) VALUES (?, ?, ?)',
                [user_id, event_id, reserved]
            );
            return { id: result.insertId, ...data };
        } catch (error) {
            throw new Error('Impossible de créer la réservation');
        }
    }

    static async update(userId, eventId, data) {
        const [result] = await pool.query(
            'UPDATE EventRegistration SET reserved = ? WHERE user_id = ? AND event_id = ?',
            [data.reserved, userId, eventId]
        );
        return result.affectedRows > 0;
    }

    static async delete(userId, eventId) {
        const [result] = await pool.query(
            'DELETE FROM EventRegistration WHERE user_id = ? AND event_id = ?', 
            [userId, eventId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = EventRegistration;