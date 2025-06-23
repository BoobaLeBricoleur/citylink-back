const { pool } = require('../config/db');

class Business {
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT b.*, u.firstname, u.lastname FROM Business b JOIN User u ON b.user_id = u.id WHERE b.id = ?', 
            [id]
        );
        return rows[0];
    }

    static async getAll(limit = 100) {
        const [rows] = await pool.query( 
            'SELECT b.*, u.firstname, u.lastname FROM Business b JOIN User u ON b.user_id = u.id ORDER BY b.created_at DESC LIMIT ?',
            [limit]
        );
        return rows;
    }

    static async getAllCategories() {
        const [rows] = await pool.query('SELECT * FROM Category ORDER BY name ASC');
        return rows;
    }

    static async create(data) {
        try {
            const { name, description, user_id, category_id, address, phone_number, email, website_url } = data;
            
            // Log des données avant insertion
            console.log('Données reçues:', {
                name, description, user_id, category_id, 
                address, phone_number, email, website_url
            });
    
            const [result] = await pool.query(
                'INSERT INTO Business (name, description, user_id, category_id, address, phone_number, email, website_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, description, user_id, category_id, address, phone_number, email, website_url || null]
            );
    
            if (!result.insertId) {
                throw new Error('Échec de l\'insertion du commerce');
            }
    
            return { id: result.insertId, ...data };
    
        } catch (error) {
            console.error('Erreur SQL:', error.message);
            throw new Error('Impossible de créer le commerce. Vérifiez les données envoyées.');
        }
    }

    static async update(id, data) {
        const allowedFields = ['name', 'description', 'category_id', 'address', 'phone_number', 'email', 'website_url'];
        const allowedData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                allowedData[field] = data[field];
            }
        }

        if (Object.keys(allowedData).length === 0) return false;

        const [result] = await pool.query(
            'UPDATE Business SET ? WHERE id = ?',
            [allowedData, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Business WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Business;