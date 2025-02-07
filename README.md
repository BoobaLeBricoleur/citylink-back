# CityLink Project Documentation

## 📋 Overview

CityLink consists of three repositories:
- -CityLink-Front (User Interface)
- CityLink-Back (API)
- CityLink-Documentation

## 🚀 Installation and Setup

### Back

1. **Clone the repository**
```bash
git clone https://github.com/BoobaLeBricoleur/citylink-back.git
cd citylink-back
```

2. **Launch Docker**
```bash
docker-compose up -d
```

3. **Import Database**
- Locate the backup file in the project root
- Import via:
  - PhpMyAdmin: http://localhost:8080
  - Or your preferred IDE
  - Credentials can be found in the docker-compose.yml file

### Frontend

1. **Clone the repository**
```bash
git clone https://github.com/BoobaLeBricoleur/citylink-front.git
cd citylink-front
```

2. **Install dependencies**
```bash
npm install
```

3. **Launch application**
```bash
npm run dev
# or
npm start
```

### Documentation

1. **Clone the repository**
```bash
git clone [documentation-repo-url]
cd citylink-documentation
```

All documentation is accessible within the project folder.

## 🔧 Architecture

```
CityLink/
├── CityLink-Front/            # User Interface
├── CityLink-Back/            # API and business logic
│   └── database.sql   # Database backup
└── CityLink-Documentation/     # Complete documentation
```

## 🛠️ Prerequisites

- Git
- Docker and Docker Compose
- Node.js and npm
- MySQL

## ⚠️ Important Notes

- The project was coded in vueJS framework
- Ensure required ports are available before launching Docker
- Database must be imported before starting the backend
- Verify all environment variables are properly configured

## 📝 Support

For questions or issues, refer to the documentation or contact the development team : 
- nathan.milito@social.aston-ecole.com
- matheo.ronval@social.aston-ecole.com
