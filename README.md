# 🏥 Hospital Information System (HIS)

A comprehensive web-based Hospital Information System built with modern technologies to manage hospital operations efficiently.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Modules

- **👥 User Management**: Role-based access control (Admin, Doctor, Nurse, Front Desk, Pharmacy, Laboratory)
- **🧾 Patient Registration**: Patient management with unique medical record numbers
- **📅 Visit Management**: Appointment scheduling and visit tracking
- **🩺 Electronic Medical Records (EMR)**: Digital patient records with SOAP notes
- **💊 Pharmacy Management**: Medicine inventory and prescription handling
- **🧪 Laboratory Integration**: Lab result management and integration
- **🏨 Inpatient Management**: Room and bed management
- **💳 Billing System**: Automated billing and payment processing
- **📊 Dashboard & Reports**: Real-time analytics and reporting

### Technical Features

- **🔐 Security**: JWT authentication, role-based authorization, input validation
- **📱 Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **🔄 Real-time Updates**: Live data synchronization
- **📈 Analytics**: Interactive charts and statistics
- **🗄️ Database**: PostgreSQL with Prisma ORM
- **🐳 Containerized**: Docker support for easy deployment

## 🧱 Technology Stack

### Frontend
- **React.js 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Lucide React** - Modern icon library
- **React Hot Toast** - Toast notifications
- **Zustand** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Prisma** - Modern database toolkit
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving

## 📁 Project Structure

```
hospital-information-system/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   └── database/       # Database configuration
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── docker-compose.yml      # Docker composition
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **Docker** and **Docker Compose** (optional, for containerized setup)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-information-system
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📦 Installation

### Manual Setup

#### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

#### 2. Database Setup

```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/hospital_db"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

#### 3. Start Development Servers

```bash
# From root directory, start both frontend and backend
npm run dev

# Or start individually:
# Backend (from backend/ directory)
npm run dev

# Frontend (from frontend/ directory)  
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/hospital_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🛠️ Development

### Available Scripts

#### Root
```bash
npm run dev              # Start both frontend and backend
npm run build           # Build both applications
npm install:all         # Install all dependencies
npm run docker:up       # Start Docker containers
npm run docker:down     # Stop Docker containers
```

#### Backend
```bash
npm run dev             # Start development server with nodemon
npm start              # Start production server
npm run db:migrate     # Run database migrations
npm run db:reset       # Reset database
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
npm test               # Run tests
```

#### Frontend
```bash
npm run dev            # Start Vite development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

### Default Login Credentials

For development and testing:

- **Email**: admin@hospital.com
- **Password**: password123
- **Role**: Admin

## 🚢 Deployment

### Docker Deployment

1. **Build and start containers**
   ```bash
   docker-compose up -d --build
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

3. **Seed database (optional)**
   ```bash
   docker-compose exec backend npx prisma db seed
   ```

### Manual Deployment

1. **Build applications**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   cd backend
   DATABASE_URL="your-production-db-url" npx prisma migrate deploy
   ```

3. **Start production servers**
   ```bash
   # Backend
   NODE_ENV=production npm start

   # Frontend (serve built files with nginx or similar)
   ```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration (Admin only)
POST /api/auth/refresh-token  # Refresh access token
POST /api/auth/logout         # User logout
```

### Core Endpoints

```
# Patients
GET    /api/patients          # Get all patients
GET    /api/patients/:id      # Get patient by ID
POST   /api/patients          # Create new patient
PUT    /api/patients/:id      # Update patient
DELETE /api/patients/:id      # Delete patient

# Visits
GET    /api/visits           # Get all visits
POST   /api/visits           # Create new visit
PUT    /api/visits/:id       # Update visit

# Medical Records
GET    /api/records          # Get medical records
POST   /api/records          # Create medical record
PUT    /api/records/:id      # Update medical record

# Medicines
GET    /api/medicines        # Get medicines
POST   /api/medicines        # Add new medicine
PUT    /api/medicines/:id    # Update medicine

# Billing
GET    /api/billing          # Get billing records
POST   /api/billing/generate # Generate new bill
PUT    /api/billing/:id      # Update billing
```

### API Response Format

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    // Validation errors (if any)
  ]
}
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure Docker builds work

## 🔍 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests (when implemented)
npm run test:e2e
```

## 📊 Performance

- **Backend**: Average API response time < 300ms
- **Frontend**: Lighthouse score > 90
- **Database**: Optimized queries with proper indexing

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- HTTPS enforcement in production
- Security headers (Helmet.js)

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Ensure database exists

2. **JWT token errors**
   - Check JWT_SECRET is set
   - Verify token hasn't expired
   - Clear browser local storage

3. **Permission denied errors**
   - Verify user role permissions
   - Check RBAC middleware configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ☕ Support

If you found this project helpful, please give it a ⭐️!

---

**Built with ❤️ for healthcare professionals**