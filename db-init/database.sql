USE citylink;

-- Table: UserRole
CREATE TABLE UserRole
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Table: User
CREATE TABLE User
(
    id              INT PRIMARY KEY AUTO_INCREMENT,
    firstname       VARCHAR(50)         NOT NULL,
    lastname        VARCHAR(50)         NOT NULL,
    company         VARCHAR(50),
    email           VARCHAR(100) UNIQUE NOT NULL,
    password        VARCHAR(255)        NOT NULL,
    address         VARCHAR(255),
    postal_code     VARCHAR(10),
    city            VARCHAR(100),
    phone           VARCHAR(20),
    birthday        DATE,
    mail_new_events BOOLEAN  DEFAULT TRUE,
    mail_events     BOOLEAN  DEFAULT TRUE,
    public_profile  BOOLEAN  DEFAULT FALSE,
    avatar          VARCHAR(255),
    role_id         INT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES UserRole (id)
);

-- Table: Category
CREATE TABLE Category
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Table: Business
CREATE TABLE Business
(
    id           INT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(100) NOT NULL,
    description  TEXT,
    user_id      INT          NOT NULL,
    category_id  INT NULL,
    address      VARCHAR(255),
    phone_number VARCHAR(20),
    email        VARCHAR(100),
    website_url  VARCHAR(255),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Category (id) ON DELETE SET NULL
);

-- Table: Event
CREATE TABLE Event
(
    id            INT PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    event_date    DATETIME     NOT NULL,
    business_id   INT          NOT NULL,
    is_reservable BOOLEAN  DEFAULT FALSE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES Business (id) ON DELETE CASCADE
);

-- Table: EventRegistration
CREATE TABLE EventRegistration
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL,
    event_id   INT NOT NULL,
    reserved   BOOLEAN  DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES Event (id) ON DELETE CASCADE,
    UNIQUE (user_id, event_id)
);

-- Table: Forum
CREATE TABLE Forum
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    user_id     INT          NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Table: ForumMessage
CREATE TABLE ForumMessage
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    forum_id   INT  NOT NULL,
    user_id    INT  NOT NULL,
    message    TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES Forum (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Table: Announcement
CREATE TABLE Announcement
(
    id               INT PRIMARY KEY AUTO_INCREMENT,
    title            VARCHAR(100) NOT NULL,
    content          TEXT         NOT NULL,
    publication_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id          INT          NOT NULL,
    is_featured      BOOLEAN  DEFAULT FALSE,
    is_active        BOOLEAN  DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Table: Review
CREATE TABLE Review
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT NOT NULL,
    business_id INT NOT NULL,
    rating      TINYINT CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES Business (id) ON DELETE CASCADE
);

-- Table: Notification
CREATE TABLE Notification
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT  NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN  DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Table: Message (Private Messaging)
CREATE TABLE Message
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    sender_id   INT  NOT NULL,
    receiver_id INT  NOT NULL,
    content     TEXT NOT NULL,
    is_read     BOOLEAN  DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Table: Emergency
CREATE TABLE Emergency
(
    id             INT PRIMARY KEY AUTO_INCREMENT,
    emergency_type VARCHAR(100) NOT NULL,
    description    TEXT         NOT NULL,
    user_id        INT          NOT NULL,
    report_date    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Table: Survey
CREATE TABLE Survey
(
    id            INT PRIMARY KEY AUTO_INCREMENT,
    question      TEXT NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id       INT  NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE
);

-- Table: SurveyOption
CREATE TABLE SurveyOption
(
    id        INT PRIMARY KEY AUTO_INCREMENT,
    survey_id INT  NOT NULL,
    `option`  TEXT NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES Survey (id) ON DELETE CASCADE
);

-- Table: SurveyResponse
CREATE TABLE SurveyResponse
(
    id               INT PRIMARY KEY AUTO_INCREMENT,
    survey_id        INT NOT NULL,
    user_id          INT NOT NULL,
    survey_option_id INT NOT NULL,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES Survey (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (survey_option_id) REFERENCES SurveyOption (id) ON DELETE CASCADE,
    UNIQUE (user_id, survey_id)
);

-- Table: Information
CREATE TABLE Information
(
    id               INT PRIMARY KEY AUTO_INCREMENT,
    title            VARCHAR(150) NOT NULL,
    content          TEXT         NOT NULL,
    summary          TEXT,
    publication_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: Tag
CREATE TABLE Tag
(
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Table: InformationTag
CREATE TABLE InformationTag
(
    information_id INT NOT NULL,
    tag_id         INT NOT NULL,
    PRIMARY KEY (information_id, tag_id),
    FOREIGN KEY (information_id) REFERENCES Information (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tag (id) ON DELETE CASCADE
);

-- Initialisation des rôles utilisateur
INSERT INTO UserRole (id, name, description)
VALUES (1, 'admin', 'Administrateur avec accès complet'),
       (2, 'user', 'Utilisateur standard'),
       (3, 'business', 'Commerçant');

-- Ajout de plusieurs utilisateurs avec des rôles différents
INSERT INTO User (firstname, lastname, company, email, password, address, postal_code, city, phone, birthday,
                  public_profile, avatar, role_id)
VALUES
-- Utilisateurs standard (password hashé: "password123")
('Marie', 'Durand', 'Fleuriste Belle Fleur', 'marie@example.com',
 '$2a$10$EkZ69tLyeSaAMPRVBXUJVuLESF1DJFIYN0em4VwPXWZdKjdxMBEFm', '12 rue des Lilas', '75001', 'Paris', '0612345678',
 '1985-04-12', TRUE, 'avatar1.jpg', 2),
('Thomas', 'Martin', 'Boulangerie Martin', 'thomas@example.com',
 '$2a$10$EkZ69tLyeSaAMPRVBXUJVuLESF1DJFIYN0em4VwPXWZdKjdxMBEFm', '45 avenue Victor Hugo', '69002', 'Lyon', '0723456789',
 '1976-09-22', TRUE, 'avatar2.jpg', 2),
('Sophia', 'Laurent', 'Café des Artistes', 'sophia@example.com',
 '$2a$10$EkZ69tLyeSaAMPRVBXUJVuLESF1DJFIYN0em4VwPXWZdKjdxMBEFm', '7 place du Marché', '33000', 'Bordeaux', '0634567890',
 '1990-01-15', FALSE, 'avatar3.jpg', 2),
('Julien', 'Petit', 'Garage Auto Plus', 'julien@example.com',
 '$2a$10$EkZ69tLyeSaAMPRVBXUJVuLESF1DJFIYN0em4VwPXWZdKjdxMBEFm', '123 route Principale', '31000', 'Toulouse',
 '0745678901', '1982-07-30', TRUE, 'avatar4.jpg', 2),
 ('Tristan', 'Monet', 'Barman alcoolique', 'tristan@example.com',
 '$2a$10$EkZ69tLyeSaAMPRVBXUJVuLESF1DJFIYN0em4VwPXWZdKjdxMBEFm', '15 rue de la Soie', '69000', 'Lyon',
 '0747037568', '1999-02-26', TRUE, 'avatar4.jpg', 2),
-- Un administrateur supplémentaire
('Claire', 'Dubois', 'Mairie', 'claire@citylink.com', '$2a$10$EkZ69tLyeSaAMPRVBXUJVuLESF1DJFIYN0em4VwPXWZdKjdxMBEFm',
 '1 place de la Mairie', '44000', 'Nantes', '0756789012', '1979-12-05', FALSE, 'avatar5.jpg', 1);

-- Catégories de commerces
INSERT INTO Category (name, description)
VALUES ('Restauration', 'Restaurants, cafés et établissements de restauration'),
       ('Commerce de proximité', 'Épiceries, boulangeries et autres commerces quotidiens'),
       ('Services', 'Services aux particuliers et aux entreprises'),
       ('Artisanat', 'Artisans et créateurs locaux'),
       ('Bien-être', 'Salons de beauté, spa, fitness et bien-être');

-- Commerces (Business)
INSERT INTO Business (name, description, user_id, category_id, address, phone_number, email, website_url)
VALUES ('Café des Artistes', 'Café convivial proposant des spécialités locales et une ambiance artistique', 3, 1,
        '7 place du Marché, 33000 Bordeaux', '0599887766', 'contact@cafedesartistes.fr', 'www.cafedesartistes.fr'),
       ('Boulangerie Martin', 'Boulangerie artisanale, spécialités de pain au levain et viennoiseries maison', 2, 2,
        '45 avenue Victor Hugo, 69002 Lyon', '0477889900', 'contact@boulangerie-martin.fr',
        'www.boulangerie-martin.fr'),
       ('Fleuriste Belle Fleur',
        'Compositions florales pour tous événements et plantes d\'intérieur', 1, 4, '12 rue des Lilas, 75001 Paris', '0144556677', 'contact@bellefleur.fr', 'www.bellefleur.fr'),
('Garage Auto Plus', 'Réparation, entretien et diagnostic pour tous types de véhicules', 4, 3, '123 route Principale,
        31000 Toulouse', '0566778899', 'contact@garage-autoplus.fr', 'www.garage-autoplus.fr'),
('Zen Spa', 'Centre de bien-être offrant massages, soins du visage et relaxation', 3, 5, '9 rue Sereine,
        33000 Bordeaux', '0577889900', 'contact@zenspa.fr', 'www.zenspa.fr');

-- Événements
INSERT INTO Event (name, description, event_date, business_id, is_reservable)
VALUES 
('Dégustation vins et fromages', 'Découverte de vins locaux accompagnés de fromages artisanaux', '2023-12-15 19:00:00', 1, TRUE),
('Atelier pâtisserie pour enfants', 'Initiation à la pâtisserie pour les 6-12 ans', '2023-12-10 14:00:00', 2, TRUE),
('Exposition florale', 'Présentation des nouvelles compositions saisonnières', '2023-11-25 10:00:00', 3, FALSE),
('Journée diagnostic gratuit', 'Vérification des points essentiels de votre véhicule sans rendez-vous', '2023-12-05 09:00:00', 4, FALSE),
('Soirée jazz et cocktails', 'Concert jazz live avec dégustation de nouveaux cocktails', '2023-12-20 20:00:00', 1, TRUE),
('Cours de yoga matinal', 'Session de yoga dynamique pour bien commencer la journée', '2023-12-12 07:30:00', 5, TRUE);

-- Inscriptions aux événements
INSERT INTO EventRegistration (user_id, event_id, reserved)
VALUES 
(1, 2, TRUE),
(1, 5, TRUE),
(2, 1, TRUE),
(3, 5, FALSE),
(4, 4, FALSE),
(4, 6, TRUE),
(3, 6, TRUE);

-- Forums
INSERT INTO Forum (name, description, user_id)
VALUES 
('Actualités locales', 'Discussions sur les événements et nouvelles du quartier', 5),
('Entraide entre voisins', 'Échange de services, prêt de matériel et conseils', 1),
('Projets communautaires', 'Propositions et organisation de projets pour améliorer notre quartier', 5),
('Bon plans et recommandations', 'Partagez vos découvertes et recommandations locales', 3);

-- Messages dans les forums
INSERT INTO ForumMessage (forum_id, user_id, message)
VALUES 
(1, 5, 'Bonjour à tous ! La mairie annonce des travaux d\'embellissement de la place centrale à partir du mois prochain.'),
       (1, 2, 'Savez-vous combien de temps vont durer ces travaux ? Cela risque d\'impacter l\'accès à ma boutique.'),
       (1, 5, 'Les travaux sont prévus pour une durée de 3 semaines. Des accès alternatifs seront mis en place.'),
       (2, 1, 'Bonjour, je recherche une échelle pour ce weekend. Quelqu\'un pourrait-il m\'en prêter une ?'),
       (2, 4, 'J\'en ai une disponible ! Envoyez-moi un message privé pour organiser.'),
(3, 3, 'Je propose d\'organiser un nettoyage du parc municipal samedi prochain. Qui serait intéressé ?'),
       (3, 1, 'Excellente idée ! Je serai présente avec ma famille.'),
       (3, 2, 'Je peux apporter des sacs et des gants pour tout le monde.'),
       (4, 3,
        'J\'ai découvert un nouveau restaurant indien qui vient d\'ouvrir, "Saveurs de Delhi", vraiment excellent !'),
       (4, 4, 'Merci pour la recommandation, j\'irai tester ce weekend !');

-- Annonces
INSERT INTO Announcement (title, content, user_id, is_featured, is_active)
VALUES 
('Nouvelle aire de jeux pour enfants', 'Nous sommes heureux d\'annoncer l\'ouverture de la nouvelle aire de jeux du parc central. Équipée de structures modernes et sécurisées,
        elle accueille les enfants de 2 à 12 ans.', 5, TRUE, TRUE),
('Fermeture temporaire de la rue des Commerces', 'En raison de travaux d\'assainissement, la rue des Commerces sera fermée à la circulation du 15 au 20 décembre. Des déviations seront mises en place.',
        5, FALSE, TRUE),
       ('Programme des festivités de Noël',
        'Retrouvez toutes les animations prévues pour les fêtes : marché de Noël, chorales, spectacle de lumières et visite du Père Noël.',
        5, TRUE, TRUE),
       ('Appel aux bénévoles : distribution de repas', 'L\'association locale recherche des bénévoles pour la distribution de repas aux personnes isolées pendant les fêtes.', 1, FALSE, TRUE),
('Lancement du budget participatif', 'Proposez vos idées pour améliorer notre ville ! Un budget de 50 000€ sera alloué aux projets citoyens sélectionnés.', 5, TRUE, TRUE);

-- Avis sur les commerces
INSERT INTO Review (user_id, business_id, rating, comment)
VALUES 
(1, 1, 5, 'Excellent café, ambiance chaleureuse et personnel attentionné. Les pâtisseries sont délicieuses !'),
(2, 3, 4, 'Très belles compositions florales et conseils avisés. Un peu cher mais la qualité est au rendez-vous.'),
(3, 2, 5, 'Les meilleurs croissants de la ville, sans aucun doute ! Et le pain reste frais longtemps.'),
(4, 5, 4, 'Massage très relaxant, cadre agréable. Je retire une étoile car la réservation était un peu compliquée.'),
(1, 4, 3, 'Service correct mais délai d\'attente un peu long. La réparation a été bien effectuée.'),
       (3, 1, 5, 'J\'adore l\'ambiance de ce café ! Les concerts du weekend sont toujours de qualité.');

-- Notifications
INSERT INTO Notification (user_id, message, is_read)
VALUES (1, 'Votre inscription à l\'événement "Atelier pâtisserie pour enfants" est confirmée.', TRUE),
(1, 'Marie Durand a répondu à votre message sur le forum "Entraide entre voisins".', FALSE),
(2, 'Rappel : l\'événement "Dégustation vins et fromages" a lieu demain à 19h.', FALSE),
       (3, 'Votre commerce "Café des Artistes" a reçu un nouvel avis 5 étoiles !', FALSE),
       (4, 'Julien Petit a accepté votre demande de prêt d\'échelle.', TRUE),
(2, 'Nouvel événement à proximité : "Soirée jazz et cocktails".', FALSE);

-- Messages privés
INSERT INTO Message (sender_id, receiver_id, content, is_read)
VALUES 
(1, 4, 'Bonjour Julien, est - ce que je pourrais emprunter votre échelle ce weekend ?', TRUE),
(4, 1, 'Bien sûr Marie ! Je peux vous la déposer samedi matin vers 10h si cela vous convient.', TRUE),
(1, 4, 'Ce serait parfait, merci beaucoup !', FALSE),
(3, 2, 'Bonjour Thomas, est - ce possible de commander un gâteau d\'anniversaire pour samedi prochain ?', TRUE),
       (2, 3, 'Bonjour Sophia, oui c\'est possible. Passez à la boulangerie demain pour discuter des détails.', TRUE),
(5, 3, 'Les travaux devant votre café débuteront lundi. Pouvons-nous prévoir une réunion pour organiser l\'accès client ?',
        FALSE);

-- Urgences
INSERT INTO Emergency (emergency_type, description, user_id)
VALUES ('Éclairage public',
        'Trois lampadaires consécutifs ne fonctionnent plus rue des Peupliers, ce qui rend la rue très sombre la nuit.',
        1),
       ('Voirie',
        'Nid de poule important au carrefour des rues du Commerce et Victor Hugo, dangereux pour les cyclistes.', 4),
       ('Propreté', 'Dépôt sauvage d\'encombrants derrière le centre commercial, présence de déchets potentiellement dangereux.', 3),
('Sécurité', 'Barrière de sécurité endommagée sur la passerelle piétonne au-dessus du canal.', 2),
('Animaux', 'Chat errant blessé repéré depuis deux jours près de l\'école primaire.', 1);

-- Sondages
INSERT INTO Survey (question, user_id)
VALUES ('Quel type d\'animation préféreriez-vous pour la fête de la ville ?', 5),
('Quel jour de la semaine préférez-vous pour les réunions de quartier ?', 5),
('Quelle amélioration prioritaire pour notre marché local ?', 3),
('Quel sport collectif aimeriez-vous voir proposé au nouveau gymnase ?', 1),
('Quelle serait la meilleure utilisation de l\'ancien bâtiment de la poste ?', 5);

-- Options des sondages
INSERT INTO SurveyOption (survey_id, `option`)
VALUES (1, 'Concert et animations musicales'),
       (1, 'Fête foraine traditionnelle'),
       (1, 'Festival gastronomique avec producteurs locaux'),
       (1, 'Compétitions sportives inter-quartiers'),
       (2, 'Lundi soir'),
       (2, 'Mercredi soir'),
       (2, 'Jeudi soir'),
       (2, 'Samedi matin'),
       (3, 'Plus de places de stationnement'),
       (3, 'Extension des horaires d\'ouverture'),
(3, 'Plus de stands de producteurs bio'),
(3, 'Espace couvert pour les jours de pluie'),
(4, 'Basketball'),
(4, 'Volleyball'),
(4, 'Handball'),
(4, 'Badminton'),
(5, 'Espace culturel et médiathèque'),
(5, 'Centre pour associations locales'),
(5, 'Espace de coworking municipal'),
(5, 'Logements sociaux');

-- Réponses aux sondages
INSERT INTO SurveyResponse (survey_id, user_id, survey_option_id)
VALUES 
(1, 1, 3),
(1, 2, 1),
(1, 3, 3),
(1, 4, 2),
(2, 1, 8),
(2, 2, 5),
(2, 3, 7),
(2, 4, 8),
(3, 1, 11),
(3, 2, 12),
(3, 4, 10),
(4, 1, 14),
(4, 3, 13),
(5, 1, 17),
(5, 2, 17),
(5, 3, 19),
(5, 4, 20);

-- Informations
INSERT INTO Information (title, content, summary, publication_date)
VALUES 
('Nouvelles règles de tri sélectif', 'À partir du 1er janvier,
        de nouvelles consignes de tri entreront en vigueur dans notre commune. Tous les emballages plastiques pourront désormais être déposés dans le bac jaune,
        y compris les films, sacs et barquettes. Les emballages en métal,
        même les plus petits comme les capsules de café ou opercules,
        seront également acceptés. Cette simplification vise à augmenter notre taux de recyclage et à réduire l\'enfouissement des déchets. Des ambassadeurs du tri seront présents sur le marché tous les samedis de décembre pour répondre à vos questions.',
        'Simplification des consignes de tri à partir du 1er janvier : tous les emballages plastiques et métalliques dans le bac jaune.',
        '2023-11-25 10:00:00'),
       ('Plan local de rénovation énergétique',
        'La municipalité lance un ambitieux plan de rénovation énergétique pour les logements anciens. Des subventions couvrant jusqu\'à 50% du montant des travaux seront disponibles pour les propriétaires sous conditions de ressources. Les travaux concernés incluent l\'isolation thermique, le remplacement des systèmes de chauffage énergivores et l\'installation d\'équipements utilisant des énergies renouvelables. Une permanence d\'information sera ouverte en mairie tous les mardis de 14h à 17h pour accompagner les habitants dans leurs démarches.', 'Lancement d\'un plan de subventions pour la rénovation énergétique des logements anciens, avec accompagnement personnalisé.',
        '2023-11-28 14:30:00'),
       ('Nouveau service de transport à la demande',
        'Pour répondre aux besoins des habitants des zones moins densément peuplées, un service de transport à la demande sera mis en place à partir du 15 décembre. Ce dispositif permettra de réserver un trajet par téléphone ou via l\'application mobile dédiée,
        au minimum 2 heures avant le déplacement souhaité. Cinq minibus écologiques desserviront l\'ensemble du territoire communal, du lundi au samedi, de 7h à 19h. Le tarif sera identique à celui des bus réguliers.',
        'Mise en place d\'un service de transport à la demande par réservation à partir du 15 décembre,
        avec une flotte de minibus écologiques.', '2023-12-01 09:15:00'),
('Agrandissement de la bibliothèque municipale', 'Après six mois de travaux,
        la bibliothèque municipale rouvrira ses portes le 10 décembre dans un espace agrandi et modernisé. La superficie est doublée,
        offrant de nouveaux espaces de lecture,
        un coin enfants plus accueillant et une salle multimédia équipée de 8 ordinateurs en libre accès. La collection a été enrichie de 3000 nouveaux ouvrages et un service de prêt de liseuses électroniques sera désormais proposé. Une semaine d\'animations gratuites est prévue pour l\'inauguration.', 'Réouverture de la bibliothèque municipale le 10 décembre après agrandissement,
        avec de nouveaux services et une collection enrichie.', '2023-12-02 11:45:00'),
('Dispositif d\'aide aux commerçants',
        'Face aux difficultés rencontrées par certains commerces de proximité, la ville met en place un dispositif d\'aide comprenant une exonération partielle de taxe foncière pour les locaux commerciaux vacants remis en activité,
        ainsi qu\'une subvention pour la rénovation des façades et vitrines. Un manager de centre-ville a également été recruté pour dynamiser le commerce local et faire le lien entre les différents acteurs économiques. Les dossiers de demande d\'aide peuvent être retirés au service développement économique de la mairie.', 'Lancement d\'aides financières pour les commerces de proximité : exonérations fiscales et subventions pour rénovation.',
        '2023-12-03 15:20:00');

-- Tags
INSERT INTO Tag (name)
VALUES ('Environnement'),
       ('Transport'),
       ('Économie locale'),
       ('Culture'),
       ('Habitat'),
       ('Services publics'),
       ('Santé'),
       ('Éducation');

-- Relations Information-Tag
INSERT INTO InformationTag (information_id, tag_id)
VALUES (1, 1), -- Nouvelles règles de tri - Environnement
       (2, 1), -- Plan rénovation énergétique - Environnement
       (2, 5), -- Plan rénovation énergétique - Habitat
       (3, 2), -- Transport à la demande - Transport
       (3, 6), -- Transport à la demande - Services publics
       (4, 4), -- Bibliothèque - Culture
       (4, 6), -- Bibliothèque - Services publics
       (5, 3); -- Aide commerçants - Économie locale