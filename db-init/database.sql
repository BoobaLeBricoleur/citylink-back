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
    id         INT PRIMARY KEY AUTO_INCREMENT,
    firstname  VARCHAR(50) NOT NULL,
    lastname   VARCHAR(50) NOT NULL,
    company    VARCHAR(100),
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role_id    INT          NULL,
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES UserRole(id) ON DELETE SET NULL
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
    category_id  INT          NULL,
    address      VARCHAR(255),
    phone_number VARCHAR(20),
    email        VARCHAR(100),
    website_url  VARCHAR(255),
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES User     (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE SET NULL
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
    id         INT PRIMARY KEY AUTO_INCREMENT,
    survey_id  INT          NOT NULL,
    `option`   TEXT         NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES Survey(id) ON DELETE CASCADE
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

-- Initialisation des rôles utilisateur
INSERT INTO UserRole (id, name, description)
VALUES (1, 'admin', 'Administrateur avec accès complet'),
       (2, 'user', 'Utilisateur standard');

-- Création d'un utilisateur admin par défaut (mot de passe: admin123, hashé avec bcrypt)
INSERT INTO User (firstname, lastname, email, password, role_id)
VALUES ('Admin', 'System', 'admin@citylink.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVHgeHWFDk9y1iYjWmQrYgCpnOjOi.', 1);