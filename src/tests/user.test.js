const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock de la dépendance User model
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
// Configuration d'un token de test
const mockToken = jwt.sign(
    { id: 1 },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
);

const adminMockToken = jwt.sign(
    { id: 99, role_id: 1 },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
);

describe('API Routes - Utilisateurs', () => {

    // Test de la route d'inscription
    describe('POST /api/users/register', () => {
        beforeEach(() => {
            User.findByEmail.mockReset();
            User.create.mockReset();
        });

        it('devrait créer un nouvel utilisateur avec succès', async () => {
            // Simuler un nouvel email (non existant)
            User.findByEmail.mockResolvedValue(null);

            // Simuler la création d'un utilisateur
            User.create.mockResolvedValue({
                id: 1,
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@example.com',
                company: 'Acme',
                role_id: 2
            });

            const res = await request(app)
                .post('/api/users/register')
                .send({
                    firstname: 'John',
                    lastname: 'Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    company: 'Acme'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Utilisateur créé avec succès');
            expect(res.body.user).toBeDefined();
            expect(res.body.token).toBeDefined();
        });

        it('devrait renvoyer une erreur si l\'email est déjà utilisé', async () => {
            // Simuler un email déjà existant
            User.findByEmail.mockResolvedValue({ id: 2, email: 'john@example.com' });

            const res = await request(app)
                .post('/api/users/register')
                .send({
                    firstname: 'John',
                    lastname: 'Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Cet email est déjà utilisé');
        });
    });

    // Test de la route de connexion
    describe('POST /api/users/login', () => {
        beforeEach(() => {
            User.findByEmail.mockReset();
            bcrypt.compare = jest.fn();
        });

        it('devrait connecter un utilisateur avec succès', async () => {
            const mockUser = {
                id: 1,
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@example.com',
                password: 'hashedpassword',
                company: 'Acme',
                role_id: 2
            };

            User.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
        });

        it('devrait refuser la connexion avec un email invalide', async () => {
            User.findByEmail.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Email ou mot de passe incorrect');
        });

        it('devrait refuser la connexion avec un mot de passe invalide', async () => {
            const mockUser = {
                id: 1,
                email: 'john@example.com',
                password: 'hashedpassword'
            };

            User.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'john@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Email ou mot de passe incorrect');
        });
    });

    // Test de la route de profil
    describe('GET /api/users/profile', () => {
        beforeEach(() => {
            User.findById = jest.fn();
        });

        it('devrait retourner les informations du profil pour un utilisateur authentifié', async () => {
            const mockUser = {
                id: 1,
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@example.com',
                company: 'Acme',
                role_id: 2
            };

            User.findById.mockResolvedValue(mockUser);

            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(mockUser.id);
            expect(res.body.email).toBe(mockUser.email);
        });

        it('devrait renvoyer une erreur 401 sans token', async () => {
            const res = await request(app).get('/api/users/profile');

            expect(res.statusCode).toBe(401);
        });
    });

    // Test pour les routes nécessitant d'être admin
    describe('GET /api/users', () => {
        beforeEach(() => {
            User.getAll = jest.fn();
        });

        it('devrait permettre à un admin de voir tous les utilisateurs', async () => {
            const mockUsers = [
                { id: 1, firstname: 'John', lastname: 'Doe' },
                { id: 2, firstname: 'Jane', lastname: 'Smith' }
            ];

            User.getAll.mockResolvedValue(mockUsers);

            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminMockToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });

        it('devrait refuser l\'accès aux non-admins', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    // Test pour modification de mot de passe
    describe('POST /api/users/change-password', () => {
        beforeEach(() => {
            User.findById = jest.fn();
            User.updatePassword = jest.fn();
            bcrypt.compare = jest.fn();
        });

        it('devrait permettre à un utilisateur de changer son mot de passe', async () => {
            const mockUser = {
                id: 1,
                email: 'john@example.com',
                password: 'hashedoldpassword'
            };

            User.findById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            User.updatePassword.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/users/change-password')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    currentPassword: 'oldpassword',
                    newPassword: 'newpassword123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Mot de passe modifié avec succès');
        });

        it('devrait refuser le changement si le mot de passe actuel est incorrect', async () => {
            const mockUser = {
                id: 1,
                email: 'john@example.com',
                password: 'hashedoldpassword'
            };

            User.findById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/api/users/change-password')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Mot de passe actuel incorrect');
        });
    });
});