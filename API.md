# Documentation API CityLink - Routes Utilisateur

## Routes Publiques (sans authentification)

### Inscription d'un utilisateur
- URL: /api/users/register
- Méthode: POST
- Body: { firstname, lastname, company (optionnel), email, password }
- Réponse: { message, user, token }

### Connexion d'un utilisateur
- URL: /api/users/login
- Méthode: POST
- Body: { email, password }
- Réponse: { user, token }

## Routes Protégées (authentification requise)

### Profil de l'utilisateur connecté
- URL: /api/users/profile
- Méthode: GET
- Headers: Authorization: Bearer {token}
- Réponse: Détails de l'utilisateur

### Changement de mot de passe
- URL: /api/users/change-password
- Méthode: POST
- Headers: Authorization: Bearer {token}
- Body: { currentPassword, newPassword }
- Réponse: { message }

### Récupérer les rôles utilisateur
- URL: /api/users/roles
- Méthode: GET
- Headers: Authorization: Bearer {token}
- Réponse: Liste des rôles

### Opérations sur un utilisateur spécifique
- URL: /api/users/:id
- Méthodes: GET, PUT, DELETE
- Headers: Authorization: Bearer {token}
- Réponse: Détails/confirmation selon l'action

## Routes Admin (authentification admin requise)

### Récupérer tous les utilisateurs
- URL: /api/users
- Méthode: GET
- Headers: Authorization: Bearer {token}
- Paramètres Query: limit, offset
- Réponse: Liste paginée des utilisateurs