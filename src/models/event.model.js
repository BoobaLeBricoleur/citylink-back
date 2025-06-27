const { pool } = require('../config/db');

class Event {
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT e.*, b.name as business_name FROM Event e JOIN Business b ON e.business_id = b.id WHERE e.id = ?', 
            [id]
        );
        return rows[0];
    }

    static async getAll(limit = 100) {
        const [rows] = await pool.query(
            'SELECT e.*, b.name as business_name FROM Event e JOIN Business b ON e.business_id = b.id ORDER BY e.event_date DESC LIMIT ?',
            [limit]
        );
        return rows;
    }

    static async create(data) {
        try {
            const { name, description, event_date, business_id, is_reservable } = data;
            
            console.log('Données reçues:', data);
    
            const [result] = await pool.query(
                'INSERT INTO Event (name, description, event_date, business_id, is_reservable) VALUES (?, ?, ?, ?, ?)',
                [name, description, event_date, business_id, is_reservable]
            );
    
            if (!result.insertId) {
                throw new Error('Échec de l\'insertion de l\'événement');
            }
    
            return { id: result.insertId, ...data };
    
        } catch (error) {
            console.error('Erreur SQL:', error.message);
            throw new Error('Impossible de créer l\'événement. Vérifiez les données envoyées.');
        }
    }

    static async update(id, data) {
        const allowedFields = ['name', 'description', 'event_date', 'business_id', 'is_reservable'];
        const allowedData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                allowedData[field] = data[field];
            }
        }

        if (Object.keys(allowedData).length === 0) return false;

        const [result] = await pool.query(
            'UPDATE Event SET ? WHERE id = ?',
            [allowedData, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Event WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Event;