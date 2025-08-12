const { pool } = require('../config/db');

class Information {
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM Information WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async getAll(limit = 100) {
        const [rows] = await pool.query(
            'SELECT * FROM Information ORDER BY publication_date DESC LIMIT ?',
            [limit]
        );
        return rows;
    }

    static async create(data) {
        try {
            const { title, content, summary } = data;

            const [result] = await pool.query(
                'INSERT INTO Information (title, content, summary) VALUES (?, ?, ?)',
                [title, content, summary || null]
            );

            if (!result.insertId) {
                throw new Error('Échec de l\'insertion de l\'information');
            }

            return { id: result.insertId, ...data };

        } catch (error) {
            console.error('Erreur SQL:', error.message);
            throw new Error('Impossible de créer l\'information. Vérifiez les données envoyées.');
        }
    }

    static async update(id, data) {
        const allowedFields = ['title', 'content', 'summary'];
        const allowedData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                allowedData[field] = data[field];
            }
        }

        if (Object.keys(allowedData).length === 0) return false;

        const [result] = await pool.query(
            'UPDATE Information SET ? WHERE id = ?',
            [allowedData, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Information WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getInformationWithTags(id) {
        const [information] = await pool.query(
            'SELECT * FROM Information WHERE id = ?',
            [id]
        );

        if (information.length === 0) {
            return null;
        }

        const [tags] = await pool.query(
            'SELECT t.* FROM Tag t ' +
            'JOIN InformationTag it ON t.id = it.tag_id ' +
            'WHERE it.information_id = ?',
            [id]
        );

        return {
            ...information[0],
            tags: tags
        };
    }

    static async addTagToInformation(informationId, tagId) {
        try {
            const [result] = await pool.query(
                'INSERT INTO InformationTag (information_id, tag_id) VALUES (?, ?)',
                [informationId, tagId]
            );

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return false;
            }
            throw error;
        }
    }

    static async removeTagFromInformation(informationId, tagId) {
        const [result] = await pool.query(
            'DELETE FROM InformationTag WHERE information_id = ? AND tag_id = ?',
            [informationId, tagId]
        );

        return result.affectedRows > 0;
    }

    static async getAllWithTags(limit = 100) {
        const [informations] = await pool.query(
            'SELECT * FROM Information ORDER BY publication_date DESC LIMIT ?',
            [limit]
        );

        const result = [];

        for (const info of informations) {
            const [tags] = await pool.query(
                'SELECT t.* FROM Tag t ' +
                'JOIN InformationTag it ON t.id = it.tag_id ' +
                'WHERE it.information_id = ?',
                [info.id]
            );

            result.push({
                ...info,
                tags: tags
            });
        }

        return result;
    }
}

module.exports = Information;