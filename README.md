# 🏢 RealtyMatch - Real Estate Matching System

> A comprehensive full-stack platform for matching real estate properties with buyer requirements using an intelligent scoring algorithm.

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![Frontend](https://img.shields.io/badge/Frontend-94%25-blue)]()
[![Backend](https://img.shields.io/badge/Backend-100%25-success)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

RealtyMatch is a modern real estate management platform that streamlines the process of matching properties with buyer requirements. Built with cutting-edge technologies, it provides:

- **Smart Matching Algorithm**: Automatically matches properties with buyer enquiries based on multiple criteria
- **Role-Based Access**: Separate dashboards for Admins and Staff with appropriate permissions
- **Real-Time Updates**: Instant synchronization across all connected clients
- **Comprehensive Management**: Full CRUD operations for users, properties, and enquiries
- **Beautiful UI**: Modern, responsive interface with dark mode support

---

## ✨ Features

### For Admins
- 📊 **Dashboard Analytics**: Real-time statistics and insights
- 👥 **User Management**: Create, update, and manage staff accounts
- 📈 **Performance Tracking**: Monitor conversion rates and team performance
- 🔐 **Full System Access**: Complete control over all features

### For Staff
- 🏘️ **Property Management**: Add, edit, and track property listings
- 👨‍👩‍👧‍👦 **Buyer Enquiries**: Manage buyer requirements and multiple needs
- 🎯 **Smart Matching**: Find best-fit properties for buyers automatically
- 📝 **Quick Actions**: Streamlined workflow for daily operations

### Technical Features
- 🔄 **Matching Algorithm**: 115-point scoring system with weighted criteria
- 🔒 **Secure Authentication**: JWT-based auth with role-based access control
- ⚡ **Performance**: Optimized database queries with proper indexing
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🌙 **Dark Mode**: Easy on the eyes with automatic theme switching
- 🛡️ **Security**: Rate limiting, input validation, password hashing

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT
- **Validation**: Zod
- **Testing**: Jest

### DevOps
- **Package Manager**: pnpm
- **Version Control**: Git
- **API Testing**: Postman
- **Linting**: ESLint + Prettier

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase account
- Git

### 1. Clone Repository

```bash
git clone https://github.com/Omkar-XD/Realty_Match_System.git
cd Realty_Match_System
```

### 2. Setup Database

1. Create project on [Supabase](https://supabase.com)
2. Run `database/schema.sql` in SQL Editor
3. Run `database/seed-data.sql` for sample data
4. Copy your Supabase credentials

### 3. Setup Backend

```bash
cd backend
pnpm install
cp .env.example .env
# Edit .env with your Supabase credentials
pnpm build
pnpm dev
```

Backend will run on `http://localhost:5000`

### 4. Setup Frontend

```bash
cd frontend
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
pnpm dev
```

Frontend will run on `http://localhost:3000`

### 5. Login

```
Email: admin@realtymatch.com
Password: password123
```

⚠️ **Change default passwords immediately!**

For detailed setup instructions, see [SETUP.md](docs/SETUP.md)

---

## 📁 Project Structure

```
realtymatch-app/
├── frontend/              # Next.js application
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── contexts/         # Context providers
│   ├── lib/             # Utilities & types
│   └── public/          # Static assets
│
├── backend/              # Express API
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── repositories/# Data access layer
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Helper functions
│   │   └── validators/  # Zod schemas
│   └── tests/           # Test files
│
├── database/            # Database files
│   ├── schema.sql      # PostgreSQL schema
│   └── seed-data.sql   # Sample data
│
└── docs/               # Documentation
    ├── API.md         # API documentation
    ├── SETUP.md       # Setup guide
    └── ARCHITECTURE.md # System design
```

---

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Setup Guide](docs/SETUP.md)** - Detailed installation steps
- **[Architecture](docs/ARCHITECTURE.md)** - System design & data flow
- **[Project Status](PROJECT_STATUS.md)** - Implementation progress

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Enquiries
- `GET /api/enquiries` - Get all enquiries
- `POST /api/enquiries` - Create enquiry
- `PUT /api/enquiries/:id` - Update enquiry
- `DELETE /api/enquiries/:id` - Delete enquiry
- `POST /api/enquiries/:id/requirements` - Add requirement

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/check-matches` - Find matches

### Statistics
- `GET /api/stats/dashboard` - Dashboard analytics

For detailed API documentation, see [API.md](docs/API.md)

---

## 📸 Screenshots

### Login Page
Clean and secure authentication interface

### Admin Dashboard
Comprehensive analytics and system overview

### Property Management
Intuitive property listing and editing

### Buyer Enquiries
Streamlined enquiry management with smart matching

### Matching Results
Visual display of property-enquiry matches with scores

---

## 🎯 Matching Algorithm

Properties are matched against enquiries using a 115-point scoring system:

| Criteria | Points | Type |
|----------|--------|------|
| Transaction Type | 20 | Required |
| Property Type | 15 | High Weight |
| Sub Type | 10 | Medium Weight |
| Budget Range | 20 + 5 bonus | High Weight |
| Location | 15 | High Weight |
| BHK | 15 | High Weight |
| Area Range | 10 + 5 bonus | Medium Weight |

Matches above 60 points are considered "Good", above 80 are "Excellent".

---

## 🧪 Testing

### Run Tests

```bash
cd backend
pnpm test
```

### Test Coverage

```bash
pnpm test:coverage
```

### Current Coverage
- Unit Tests: User Service, Matching Service
- Integration Tests: Auth, Property CRUD
- Target Coverage: 80%+

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Omkar**
- GitHub: [@Omkar-XD](https://github.com/Omkar-XD)
- Project Link: [RealtyMatch System](https://github.com/Omkar-XD/Realty_Match_System)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 📊 Project Status

| Component | Status | Completion |
|-----------|--------|------------|
| Frontend | ✅ Ready | 94% |
| Backend | ✅ Complete | 100% |
| Database | ✅ Complete | 100% |
| Tests | 🔄 In Progress | 60% |
| Docs | ✅ Complete | 100% |
| **Overall** | **✅ Production Ready** | **94%** |

---

## 🎉 Features Roadmap

### Current (v1.0)
- ✅ User management
- ✅ Property CRUD
- ✅ Enquiry management
- ✅ Smart matching
- ✅ Dashboard analytics

### Planned (v2.0)
- [ ] Image upload
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Advanced filters
- [ ] PDF reports
- [ ] Mobile app

---

## 💬 Support

Having issues? Check our documentation or create an issue:

- 📖 [Documentation](docs/)
- 🐛 [Report Bug](https://github.com/Omkar-XD/Realty_Match_System/issues)
- 💡 [Request Feature](https://github.com/Omkar-XD/Realty_Match_System/issues)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**Built with ❤️ using Next.js, Express, and Supabase**

[View Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>