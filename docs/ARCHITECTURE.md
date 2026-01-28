# RealtyMatch System - Architecture Documentation

## 📐 System Overview

RealtyMatch is a full-stack real estate matching platform built with modern technologies and best practices.

### Tech Stack

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Context API for state management

**Backend:**
- Node.js with Express
- TypeScript
- Supabase (PostgreSQL)
- JWT Authentication
- Zod validation

**DevOps:**
- Git for version control
- pnpm for package management
- Jest for testing
- ESLint & Prettier for code quality

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Login Page  │  │  Dashboard   │  │  Buyers/     │      │
│  │              │  │              │  │  Owners      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                 │               │
│           └────────────────┴─────────────────┘               │
│                          │                                   │
│                   Context Providers                          │
│                  (Auth & Data Context)                       │
│                          │                                   │
│                    API Client Layer                          │
│                  (axios/fetch wrapper)                       │
└──────────────────────────┼───────────────────────────────────┘
                           │
                  HTTPS/REST API
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    SERVER LAYER                               │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │              Express Application                    │      │
│  │                                                      │      │
│  │  Middleware Layer:                                  │      │
│  │  • CORS                                             │      │
│  │  • Helmet (Security)                                │      │
│  │  • Rate Limiting                                    │      │
│  │  • Request Logging                                  │      │
│  │  • JWT Authentication                               │      │
│  │  • Error Handling                                   │      │
│  └────────────────────────────────────────────────────┘      │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐      │
│  │               Routes Layer                          │      │
│  │                                                      │      │
│  │  /api/auth          /api/users                      │      │
│  │  /api/enquiries     /api/properties                 │      │
│  │  /api/stats                                         │      │
│  └────────────────────────────────────────────────────┘      │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐      │
│  │             Controllers Layer                       │      │
│  │                                                      │      │
│  │  • Request validation                               │      │
│  │  • Response formatting                              │      │
│  │  • Error handling                                   │      │
│  └────────────────────────────────────────────────────┘      │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐      │
│  │              Services Layer                         │      │
│  │                                                      │      │
│  │  • Business Logic                                   │      │
│  │  • Matching Algorithm                               │      │
│  │  • Data Validation                                  │      │
│  │  • Authentication Logic                             │      │
│  └────────────────────────────────────────────────────┘      │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐      │
│  │           Repositories Layer                        │      │
│  │                                                      │      │
│  │  • Database queries                                 │      │
│  │  • CRUD operations                                  │      │
│  │  • Data mapping                                     │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    Supabase Client
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                   DATABASE LAYER                              │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │              PostgreSQL (Supabase)                  │      │
│  │                                                      │      │
│  │  Tables:                                            │      │
│  │  ┌──────────┐  ┌───────────┐  ┌────────────┐      │      │
│  │  │  users   │  │ enquiries │  │ properties │      │      │
│  │  └──────────┘  └───────────┘  └────────────┘      │      │
│  │                                                      │      │
│  │  Indexes: Email, Status, Transaction Type, etc.    │      │
│  │  Triggers: Auto-update timestamps                   │      │
│  │  Views: Active enquiries, Available properties     │      │
│  └────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

---

## 📦 Project Structure

```
realtymatch-app/
│
├── frontend/                    # Next.js Frontend
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn UI components
│   │   ├── *-dashboard.tsx     # Dashboard components
│   │   ├── *-page.tsx          # Page components
│   │   └── *-modal.tsx         # Modal components
│   │
│   ├── contexts/               # React Context
│   │   ├── auth-context.tsx   # Authentication
│   │   └── data-context.tsx   # Data management
│   │
│   ├── lib/                    # Utilities
│   │   ├── types.ts           # TypeScript types
│   │   ├── utils.ts           # Helper functions
│   │   └── api-client.ts      # API wrapper
│   │
│   └── public/                # Static assets
│
├── backend/                    # Express Backend
│   ├── src/
│   │   ├── config/            # Configuration
│   │   │   ├── database.ts    # Supabase config
│   │   │   ├── environment.ts # Environment vars
│   │   │   └── constants.ts   # Constants
│   │   │
│   │   ├── types/             # TypeScript types
│   │   │   ├── user.types.ts
│   │   │   ├── enquiry.types.ts
│   │   │   ├── property.types.ts
│   │   │   ├── auth.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── logger.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   │
│   │   ├── validators/        # Zod schemas
│   │   │   ├── auth.validator.ts
│   │   │   ├── user.validator.ts
│   │   │   ├── enquiry.validator.ts
│   │   │   └── property.validator.ts
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   ├── jwt.util.ts
│   │   │   ├── password.util.ts
│   │   │   ├── response.util.ts
│   │   │   ├── error.util.ts
│   │   │   ├── logger.util.ts
│   │   │   └── validation.util.ts
│   │   │
│   │   ├── repositories/      # Data access
│   │   │   ├── user.repository.ts
│   │   │   ├── enquiry.repository.ts
│   │   │   └── property.repository.ts
│   │   │
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── enquiry.service.ts
│   │   │   ├── property.service.ts
│   │   │   ├── matching.service.ts
│   │   │   └── stats.service.ts
│   │   │
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── enquiry.controller.ts
│   │   │   ├── property.controller.ts
│   │   │   └── stats.controller.ts
│   │   │
│   │   ├── routes/            # API routes
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── enquiry.routes.ts
│   │   │   ├── property.routes.ts
│   │   │   └── stats.routes.ts
│   │   │
│   │   ├── scripts/           # Utility scripts
│   │   │   ├── setup-database.ts
│   │   │   ├── seed-users.ts
│   │   │   └── migrate.ts
│   │   │
│   │   ├── app.ts            # Express app config
│   │   └── server.ts         # Server entry point
│   │
│   └── tests/                # Test files
│       ├── unit/             # Unit tests
│       ├── integration/      # Integration tests
│       └── setup.ts          # Test setup
│
├── database/                 # Database files
│   ├── schema.sql           # Database schema
│   ├── seed-data.sql        # Sample data
│   └── migrations/          # Schema migrations
│
└── docs/                    # Documentation
    ├── API.md              # API documentation
    ├── SETUP.md            # Setup guide
    ├── ARCHITECTURE.md     # This file
    └── USER_GUIDE.md       # User manual
```

---

## 🔄 Data Flow

### 1. Authentication Flow

```
User Login → Frontend
    ↓
Auth Context → API Client
    ↓
POST /api/auth/login → Backend
    ↓
Auth Controller → Auth Service
    ↓
User Repository → Supabase
    ↓
Validate Password → Generate JWT
    ↓
Return Token → Frontend
    ↓
Store in Context → Redirect to Dashboard
```

### 2. Property Creation Flow

```
User fills form → Frontend
    ↓
Property Form Modal → Validation
    ↓
Data Context → API Client
    ↓
POST /api/properties → Backend (with JWT)
    ↓
Auth Middleware → Validate Token
    ↓
Property Controller → Zod Validation
    ↓
Property Service → Business Logic
    ↓
Property Repository → Supabase INSERT
    ↓
Return Created Property → Frontend
    ↓
Update State → Refresh UI → Show Success
```

### 3. Matching Flow

```
User clicks "Check Matches" → Frontend
    ↓
Property Card → API Call
    ↓
POST /api/properties/:id/check-matches → Backend
    ↓
Property Controller → Matching Service
    ↓
Get Property → Get Active Enquiries
    ↓
Calculate Match Scores → Sort by Score
    ↓
Return Matches → Frontend
    ↓
Display in Modal → Show Match Percentage
```

---

## 🔐 Security Architecture

### Authentication

```
JWT Token Structure:
{
  "userId": "uuid",
  "email": "user@email.com",
  "role": "staff",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authorization Levels

1. **Public Routes:** `/api/auth/login`, `/health`
2. **Authenticated Routes:** Most endpoints (require valid JWT)
3. **Admin-only Routes:** `/api/users/*` (POST, PUT, DELETE)

### Security Measures

- Helmet for HTTP headers
- CORS configuration
- Rate limiting
- Password hashing (bcrypt)
- JWT expiration
- Input validation (Zod)
- SQL injection prevention (Supabase handles this)
- XSS prevention (React handles this)

---

## 📊 Database Schema

### Users Table
```sql
users
├── id (UUID, PK)
├── name (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── phone (VARCHAR)
├── role (VARCHAR: admin/staff)
├── password_hash (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Indexes: email, role
```

### Enquiries Table
```sql
enquiries
├── id (UUID, PK)
├── buyer_name (VARCHAR)
├── buyer_phone (VARCHAR)
├── buyer_email (VARCHAR)
├── transaction_type (VARCHAR)
├── property_type (VARCHAR)
├── property_sub_type (VARCHAR)
├── budget_min (DECIMAL)
├── budget_max (DECIMAL)
├── location_preferences (TEXT[])
├── bhk_preferences (INTEGER[])
├── area_min (DECIMAL)
├── area_max (DECIMAL)
├── requirements (JSONB)
├── notes (TEXT)
├── status (VARCHAR: active/closed/won/lost)
├── added_by (UUID, FK → users.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Indexes: status, transaction_type, property_type, added_by
```

### Properties Table
```sql
properties
├── id (UUID, PK)
├── property_id (VARCHAR, UNIQUE)
├── owner_name (VARCHAR)
├── owner_phone (VARCHAR)
├── owner_email (VARCHAR)
├── transaction_type (VARCHAR)
├── property_type (VARCHAR)
├── property_sub_type (VARCHAR)
├── price (DECIMAL)
├── location (VARCHAR)
├── area (DECIMAL)
├── bhk (INTEGER)
├── bathrooms (INTEGER)
├── furnishing (VARCHAR)
├── parking (VARCHAR)
├── floor_number (INTEGER)
├── total_floors (INTEGER)
├── age_of_property (INTEGER)
├── facing (VARCHAR)
├── amenities (TEXT[])
├── images (TEXT[])
├── description (TEXT)
├── status (VARCHAR: available/sold/rented/unavailable)
├── added_by (UUID, FK → users.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Indexes: property_id, status, transaction_type, location, bhk, price
```

---

## 🎯 Matching Algorithm

### Scoring System

```javascript
Total Score (max 115):
├── Transaction Type (20) [REQUIRED]
├── Property Type (15)
├── Sub Type (10)
├── Budget Range (20 + 5 bonus)
├── Location (15)
├── BHK (15)
└── Area Range (10 + 5 bonus)
```

### Match Criteria

1. **Must Match:** Transaction type (Buy/Rent/Lease)
2. **Highly Weighted:** Budget, Location, BHK
3. **Moderately Weighted:** Property type, Area
4. **Bonus Points:** Sweet spot pricing and area

---

## 🚀 Scalability Considerations

### Current Capacity
- **Users:** Up to 100 concurrent users
- **Properties:** Unlimited (database constraint)
- **Enquiries:** Unlimited (database constraint)
- **Matches:** Calculated on-demand

### Optimization Strategies

1. **Database:**
   - Proper indexing
   - Connection pooling (Supabase handles)
   - Query optimization

2. **Backend:**
   - Rate limiting
   - Caching (can be added)
   - Load balancing (for production)

3. **Frontend:**
   - Code splitting
   - Lazy loading
   - Image optimization

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Matching algorithm

### Integration Tests
- API endpoints
- Authentication flow
- CRUD operations

### Manual Testing
- UI/UX flows
- Edge cases
- Browser compatibility

---

## 📈 Future Enhancements

1. **Features:**
   - Image upload for properties
   - Advanced search filters
   - Notifications system
   - Email integration
   - WhatsApp integration
   - PDF report generation

2. **Technical:**
   - Redis caching
   - WebSocket for real-time updates
   - GraphQL API option
   - Microservices architecture
   - Docker containerization

3. **Analytics:**
   - User activity tracking
   - Property view analytics
   - Match success rate
   - Conversion funnel

---

## 🔧 Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and rotate JWT secrets
- Database backups (automated by Supabase)
- Monitor error logs
- Performance optimization

### Monitoring
- Server uptime
- API response times
- Error rates
- Database query performance

---

## 📞 Support & Contribution

For architecture questions or improvements:
- Open an issue on GitHub
- Contact: tech@realtymatch.com
- Review contribution guidelines

---

*Last Updated: January 2025*