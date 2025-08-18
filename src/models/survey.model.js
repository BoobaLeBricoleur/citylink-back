const {pool} = require('../config/db');

class Survey {
    static async getAll(limit = 100) {
        const [rows] = await pool.query(
            'SELECT s.*, u.firstname, u.lastname FROM Survey s JOIN User u ON s.user_id = u.id ORDER BY s.creation_date DESC LIMIT ?',
            [limit]
        );

        const surveys = [];
        for (const survey of rows) {
            // Récupérer les options pour chaque sondage
            const options = await this.getSurveyOptions(survey.id);
            // Ajouter les options au sondage
            surveys.push({
                ...survey,
                options
            });
        }

        return surveys;
    }

    static async findById(id) {
        // Récupérer le sondage
        const [rows] = await pool.query(
            'SELECT s.*, u.firstname, u.lastname FROM Survey s JOIN User u ON s.user_id = u.id WHERE s.id = ?',
            [id]
        );

        if (rows.length === 0) return null;

        const survey = rows[0];

        // Récupérer les options pour le sondage
        const options = await this.getSurveyOptions(id);

        // Récupérer les statistiques de réponses
        const stats = await this.getSurveyStats(id);

        return {
            ...survey,
            options,
            stats
        };
    }

    static async getSurveyOptions(surveyId) {
        const [options] = await pool.query(
            'SELECT * FROM SurveyOption WHERE survey_id = ?',
            [surveyId]
        );
        return options;
    }

    static async getSurveyStats(surveyId) {
        const [results] = await pool.query(
            `SELECT so.id, so.option, COUNT(sr.id) as count 
             FROM SurveyOption so 
             LEFT JOIN SurveyResponse sr ON so.id = sr.survey_option_id 
             WHERE so.survey_id = ? 
             GROUP BY so.id`,
            [surveyId]
        );

        // Calculer le total des réponses pour les pourcentages
        const totalResponses = results.reduce((sum, option) => sum + option.count, 0);

        // Ajouter le pourcentage à chaque option
        return results.map(option => ({
            ...option,
            percentage: totalResponses > 0 ? Math.round((option.count / totalResponses) * 100) : 0
        }));
    }

    static async create(data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const {question, options, user_id} = data;

            // Insérer le sondage
            const [surveyResult] = await connection.query(
                'INSERT INTO Survey (question, user_id) VALUES (?, ?)',
                [question, user_id]
            );

            if (!surveyResult.insertId) {
                throw new Error("Échec de l'insertion du sondage");
            }

            const surveyId = surveyResult.insertId;

            // Insérer les options du sondage
            for (const option of options) {
                await connection.query(
                    'INSERT INTO SurveyOption (survey_id, `option`) VALUES (?, ?)',
                    [surveyId, option]
                );
            }

            await connection.commit();
            return {id: surveyId, question, options, user_id};
        } catch (error) {
            await connection.rollback();
            console.error('Erreur SQL:', error.message);
            throw new Error('Impossible de créer le sondage. Vérifiez les données envoyées.');
        } finally {
            connection.release();
        }
    }

    static async update(id, data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const {question, options} = data;

            // Mettre à jour la question du sondage
            if (question) {
                const [result] = await connection.query(
                    'UPDATE Survey SET question = ? WHERE id = ?',
                    [question, id]
                );

                if (result.affectedRows === 0) {
                    throw new Error('Sondage non trouvé');
                }
            }

            // Si des options sont fournies, mettre à jour les options
            if (options && options.length > 0) {
                // Supprimer les anciennes options qui n'ont pas de réponses
                await connection.query(
                    `DELETE so FROM SurveyOption so 
                     LEFT JOIN SurveyResponse sr ON so.id = sr.survey_option_id 
                     WHERE so.survey_id = ? AND sr.id IS NULL`,
                    [id]
                );

                // Obtenir les options existantes
                const [existingOptions] = await connection.query(
                    'SELECT * FROM SurveyOption WHERE survey_id = ?',
                    [id]
                );

                // Mettre à jour les options existantes ou ajouter de nouvelles
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];

                    if (i < existingOptions.length) {
                        // Mettre à jour une option existante
                        await connection.query(
                            'UPDATE SurveyOption SET `option` = ? WHERE id = ?',
                            [option, existingOptions[i].id]
                        );
                    } else {
                        // Ajouter une nouvelle option
                        await connection.query(
                            'INSERT INTO SurveyOption (survey_id, `option`) VALUES (?, ?)',
                            [id, option]
                        );
                    }
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('Erreur SQL:', error.message);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        // Les suppressions en cascade s'occupent de supprimer les options et réponses
        const [result] = await pool.query('DELETE FROM Survey WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async vote(data) {
        const {survey_id, user_id, option_id} = data;

        try {
            // Vérifier si l'utilisateur a déjà voté pour ce sondage
            const [existingVotes] = await pool.query(
                'SELECT id FROM SurveyResponse WHERE survey_id = ? AND user_id = ?',
                [survey_id, user_id]
            );

            if (existingVotes.length > 0) {
                // Mettre à jour le vote existant
                const [result] = await pool.query(
                    'UPDATE SurveyResponse SET survey_option_id = ? WHERE survey_id = ? AND user_id = ?',
                    [option_id, survey_id, user_id]
                );
                return result.affectedRows > 0;
            } else {
                // Créer un nouveau vote
                const [result] = await pool.query(
                    'INSERT INTO SurveyResponse (survey_id, user_id, survey_option_id) VALUES (?, ?, ?)',
                    [survey_id, user_id, option_id]
                );
                return result.insertId > 0;
            }
        } catch (error) {
            console.error('Erreur SQL:', error.message);
            throw new Error('Impossible de voter. Vérifiez les données envoyées.');
        }
    }

    static async getUserVote(survey_id, user_id) {
        const [rows] = await pool.query(
            'SELECT * FROM SurveyResponse WHERE survey_id = ? AND user_id = ?',
            [survey_id, user_id]
        );
        return rows[0] || null;
    }
}

module.exports = Survey;
