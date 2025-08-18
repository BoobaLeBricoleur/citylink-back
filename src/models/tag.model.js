const { pool } = require('../config/db');

class Tag {
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM Tag WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByName(name) {
        const [rows] = await pool.query(
            'SELECT * FROM Tag WHERE name = ?',
            [name]
        );
        return rows[0];
    }

    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM Tag ORDER BY name ASC');
        return rows;
    }

    static async create(data) {
        try {
            const { name } = data;

            const [result] = await pool.query(
                'INSERT INTO Tag (name) VALUES (?)',
                [name]
            );

            if (!result.insertId) {
                throw new Error('Échec de l\'insertion du tag');
            }

            return { id: result.insertId, name };

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Un tag avec ce nom existe déjà');
            }
            console.error('Erreur SQL:', error.message);
            throw new Error('Impossible de créer le tag. Vérifiez les données envoyées.');
        }
    }

    static async update(id, data) {
        try {
            const { name } = data;

            const [result] = await pool.query(
                'UPDATE Tag SET name = ? WHERE id = ?',
                [name, id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Un tag avec ce nom existe déjà');
            }
            throw error;
        }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Tag WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getInformationsByTagId(tagId) {
        const [rows] = await pool.query(
            'SELECT i.* FROM Information i ' +
            'JOIN InformationTag it ON i.id = it.information_id ' +
            'WHERE it.tag_id = ? ' +
            'ORDER BY i.publication_date DESC',
            [tagId]
        );

        return rows;
    }
}

module.exports = Tag;