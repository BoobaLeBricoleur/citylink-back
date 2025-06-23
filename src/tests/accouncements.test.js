const request = require('supertest');
const app = require('../app');
const Announcement = require('../models/announcement.model');
const jwt = require('jsonwebtoken');

jest.mock('../models/announcement.model');

jest.mock('../middlewares/auth.middleware', () => {
    console.log('🔍 Mock d\'authentification chargé!');
    return {
        auth: (req, res, next) => {
            console.log('🔒 Middleware auth utilisé');
            req.user = { id: 1, role_id: 2 };
            next();
        },
        adminAuth: (req, res, next) => {
            console.log('👑 Middleware adminAuth utilisé');
            req.user = { id: 99, role_id: 1 };
            next();
        }
    };
});

const userToken = jwt.sign(
    { id: 1, role_id: 2 },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
);

const adminToken = jwt.sign(
    { id: 99, role_id: 1 },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
);

describe('API Routes - Annonces', () => {
    describe('GET /api/announcements', () => {
        beforeEach(() => {
            Announcement.getAll.mockReset();
        });

        it('devrait récupérer toutes les annonces avec succès', async () => {
            const mockAnnouncements = [
                { id: 1, title: 'Annonce 1', content: 'Contenu 1', publication_date: '2023-10-01', user_id: 1, is_featured: 1 },
                { id: 2, title: 'Annonce 2', content: 'Contenu 2', publication_date: '2023-10-02', user_id: 1, is_featured: 0 }
            ];

            Announcement.getAll.mockResolvedValue(mockAnnouncements);

            const res = await request(app)
                .get('/api/announcements')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(Announcement.getAll).toHaveBeenCalledWith(100, 0);
        });

        it('devrait appliquer correctement les paramètres limit et offset', async () => {
            Announcement.getAll.mockResolvedValue([]);

            await request(app)
                .get('/api/announcements?limit=10&offset=20')
                .set('Authorization', `Bearer ${userToken}`);

            expect(Announcement.getAll).toHaveBeenCalledWith(10, 20);
        });

        it('devrait renvoyer une erreur 401 sans token', async () => {
            const res = await request(app).get('/api/announcements');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/announcements/:id', () => {
        beforeEach(() => {
            Announcement.findById.mockReset();
        });

        it('devrait récupérer une annonce spécifique avec succès', async () => {
            const mockAnnouncement = {
                id: 1,
                title: 'Annonce Test',
                content: 'Contenu de test',
                publication_date: '2023-10-01',
                user_id: 1,
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@example.com'
            };

            Announcement.findById.mockResolvedValue(mockAnnouncement);

            const res = await request(app)
                .get('/api/announcements/1')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.title).toBe('Annonce Test');
            expect(Announcement.findById).toHaveBeenCalledWith('1');
        });

        it('devrait renvoyer une 404 pour une annonce inexistante', async () => {
            Announcement.findById.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/announcements/999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Annonce non trouvée');
        });
    });

    describe('POST /api/announcements', () => {
        beforeEach(() => {
            Announcement.create.mockReset();
        });

        it('devrait créer une nouvelle annonce avec succès', async () => {
            const announcementData = {
                title: 'Nouvelle Annonce',
                content: 'Contenu de la nouvelle annonce'
            };

            const createdAnnouncement = {
                id: 3,
                ...announcementData,
                user_id: 1,
                is_featured: false,
                is_active: true
            };

            Announcement.create.mockResolvedValue(createdAnnouncement);

            const res = await request(app)
                .post('/api/announcements')
                .set('Authorization', `Bearer ${userToken}`)
                .send(announcementData);

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Annonce créée');
            expect(res.body.announcement).toEqual(createdAnnouncement);
            expect(Announcement.create).toHaveBeenCalledWith({
                title: 'Nouvelle Annonce',
                content: 'Contenu de la nouvelle annonce',
                user_id: 1
            });
        });

        it('devrait exiger l\'authentification pour créer une annonce', async () => {
            const res = await request(app)
                .post('/api/announcements')
                .send({ title: 'Test', content: 'Contenu' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/announcements/:id', () => {
        beforeEach(() => {
            Announcement.findById.mockReset();
            Announcement.update.mockReset();
        });

        it('devrait mettre à jour une annonce existante avec succès', async () => {
            const mockAnnouncement = {
                id: 1,
                title: 'Ancienne Annonce',
                content: 'Ancien contenu',
                user_id: 1,
                is_featured: 0
            };

            Announcement.findById.mockResolvedValue(mockAnnouncement);
            Announcement.update.mockResolvedValue(true);

            const updateData = {
                title: 'Annonce Mise à Jour',
                content: 'Contenu mis à jour',
                is_featured: 1
            };

            const res = await request(app)
                .put('/api/announcements/1')
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Annonce mise à jour');
            expect(Announcement.update).toHaveBeenCalledWith('1', updateData);
        });

        it('devrait refuser la mise à jour par un utilisateur non autorisé', async () => {
            const mockAnnouncement = {
                id: 1,
                title: 'Annonce',
                content: 'Contenu',
                user_id: 2 // Autre utilisateur
            };

            Announcement.findById.mockResolvedValue(mockAnnouncement);

            const res = await request(app)
                .put('/api/announcements/1')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Nouveau Titre' });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Non autorisé');
        });

        it('devrait permettre à un admin de mettre à jour n\'importe quelle annonce', async () => {
            const mockAnnouncement = {
                id: 1,
                title: 'Annonce',
                content: 'Contenu',
                user_id: 2 // Autre utilisateur
            };

            Announcement.findById.mockResolvedValue(mockAnnouncement);
            Announcement.update.mockResolvedValue(true);

            const res = await request(app)
                .put('/api/announcements/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Nouveau Titre' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Annonce mise à jour');
        });
    });

    describe('DELETE /api/announcements/:id', () => {
        beforeEach(() => {
            Announcement.findById.mockReset();
            Announcement.delete.mockReset();
        });

        it('devrait supprimer une annonce existante avec succès', async () => {
            const mockAnnouncement = {
                id: 1,
                title: 'Annonce à supprimer',
                user_id: 1
            };

            Announcement.findById.mockResolvedValue(mockAnnouncement);
            Announcement.delete.mockResolvedValue(true);

            const res = await request(app)
                .delete('/api/announcements/1')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Annonce supprimée');
            expect(Announcement.delete).toHaveBeenCalledWith('1');
        });

        it('devrait renvoyer une 404 pour une annonce inexistante', async () => {
            Announcement.findById.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/announcements/999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Annonce non trouvée');
        });

        it('devrait refuser la suppression par un utilisateur non autorisé', async () => {
            const mockAnnouncement = {
                id: 1,
                title: 'Annonce',
                user_id: 2
            };

            Announcement.findById.mockResolvedValue(mockAnnouncement);

            const res = await request(app)
                .delete('/api/announcements/1')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Non autorisé');
        });

        it('devrait permettre à un admin de supprimer n\'importe quelle annonce', async () => {
            const mockAnnouncement = {
                id: 1,
                title: 'Annonce',
                user_id: 2
            };

            Announcement.findById.mockResolvedValue(mockAnnouncement);
            Announcement.delete.mockResolvedValue(true);

            const res = await request(app)
                .delete('/api/announcements/1')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Annonce supprimée');
        });
    });
});