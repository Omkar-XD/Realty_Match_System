# RealtyMatch System - Complete Setup Guide

## 🎯 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - `npm install -g pnpm`
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)

### Optional (Recommended)
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Postman** - For API testing
- **PostgreSQL Client** - For database management

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/Omkar-XD/Realty_Match_System.git
cd Realty_Match_System
```

---

## 🗄️ Step 2: Setup Supabase Database

### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in details:
   - **Name:** realtymatch-db
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
4. Click "Create new project"

### 2.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `database/schema.sql`
4. Click "Run" to execute
5. Wait for completion (should show "Success")

### 2.3 Seed Database with Sample Data

1. In SQL Editor, click "New Query"
2. Copy contents of `database/seed-data.sql`
3. Click "Run" to execute
4. Verify data by running:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM enquiries;
SELECT COUNT(*) FROM properties;
```

### 2.4 Get API Credentials

1. Go to **Project Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon/public key** (long string starting with eyJ...)
   - **service_role key** (long string, keep secret!)

---

## ⚙️ Step 3: Backend Setup

### 3.1 Navigate to Backend Folder

```bash
cd backend
```

### 3.2 Install Dependencies

```bash
pnpm install
```

### 3.3 Configure Environment Variables

Create `.env` file in backend folder:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Frontend
FRONTEND_URL=http://localhost:3000

# Supabase (Replace with your values)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT (Change this to a random secret)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3.4 Generate JWT Secret

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Use the generated string as your `JWT_SECRET`.

### 3.5 Build TypeScript

```bash
pnpm build
```

### 3.6 Start Development Server

```bash
pnpm dev
```

You should see:
```
🚀 RealtyMatch API Server running on port 5000
📍 Environment: development
🌐 API URL: http://localhost:5000
```

### 3.7 Test Backend

Open browser or Postman:
```
http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-01-28T..."
}
```

---

## 🎨 Step 4: Frontend Setup

### 4.1 Navigate to Frontend Folder

```bash
cd ../frontend  # From backend folder
# OR
cd frontend     # From root folder
```

### 4.2 Install Dependencies

```bash
pnpm install
```

### 4.3 Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4.4 Start Development Server

```bash
pnpm dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 4.5 Open Application

Navigate to: `http://localhost:3000`

---

## 🔐 Step 5: First Login

### Default Admin Credentials

```
Email: admin@realtymatch.com
Password: password123
```

### Default Staff Credentials

```
Staff 1:
Email: rajesh@realtymatch.com
Password: password123

Staff 2:
Email: priya@realtymatch.com
Password: password123

Staff 3:
Email: amit@realtymatch.com
Password: password123
```

⚠️ **IMPORTANT:** Change these passwords immediately after first login!

---

## 🧪 Step 6: Run Tests (Optional)

### Backend Tests

```bash
cd backend
pnpm test
```

### Test Coverage

```bash
pnpm test:coverage
```

---

## 🚀 Step 7: Production Deployment

### Backend (Recommended: Railway/Render/Heroku)

1. **Create Account** on hosting platform
2. **Connect Repository**
3. **Add Environment Variables** (from .env)
4. **Deploy**

### Frontend (Recommended: Vercel/Netlify)

1. **Push to GitHub**
2. **Import Project** on Vercel/Netlify
3. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api
   ```
4. **Deploy**

---

## 🔧 Troubleshooting

### Backend Won't Start

**Problem:** Port 5000 already in use
```bash
# Solution: Change port in .env
PORT=5001
```

**Problem:** Database connection fails
```bash
# Check:
1. SUPABASE_URL is correct
2. SUPABASE_SERVICE_KEY is correct (not ANON_KEY)
3. Internet connection is working
```

### Frontend Won't Start

**Problem:** Port 3000 already in use
```bash
# Solution: Start on different port
pnpm dev -p 3001
```

**Problem:** API calls failing
```bash
# Check:
1. Backend is running on correct port
2. .env.local has correct NEXT_PUBLIC_API_URL
3. No CORS issues (should be configured in backend)
```

### Login Not Working

```bash
# Check:
1. Database has seed data
2. Password is exactly "password123"
3. Email is lowercase
4. Backend logs for errors
```

### TypeScript Errors

```bash
# Clean and rebuild
cd backend
rm -rf node_modules dist
pnpm install
pnpm build

cd ../frontend
rm -rf .next node_modules
pnpm install
pnpm dev
```

---

## 📊 Verify Installation

Run these checks to ensure everything is working:

### ✅ Backend Checklist

- [ ] Backend starts without errors
- [ ] Health endpoint returns OK
- [ ] Can login with default credentials
- [ ] Can fetch users list
- [ ] Can fetch properties list
- [ ] Can fetch enquiries list

### ✅ Frontend Checklist

- [ ] Frontend loads without errors
- [ ] Login page displays correctly
- [ ] Can login successfully
- [ ] Dashboard displays stats
- [ ] Can view Buyers page
- [ ] Can view Owners page
- [ ] Can view Profile page

### ✅ Database Checklist

```sql
-- Run in Supabase SQL Editor
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Enquiries', COUNT(*) FROM enquiries
UNION ALL
SELECT 'Properties', COUNT(*) FROM properties;
```

Should show:
```
Users:      4
Enquiries:  5
Properties: 7
```

---

## 📱 Access Points

Once everything is running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health
- **Supabase Dashboard:** https://app.supabase.com

---

## 🎓 Next Steps

1. **Change default passwords** for all users
2. **Create new users** for your team
3. **Add real properties and enquiries**
4. **Test matching algorithm**
5. **Customize UI** as needed
6. **Set up production deployment**

---

## 📞 Support

For issues or questions:

1. Check the documentation in `/docs` folder
2. Review API documentation in `docs/API.md`
3. Check GitHub Issues
4. Contact: admin@realtymatch.com

---

## 🔄 Update Instructions

To update to latest version:

```bash
git pull origin main
cd backend && pnpm install && pnpm build
cd ../frontend && pnpm install
```

---

## ⚠️ Security Notes

1. **Never commit `.env` files** to Git
2. **Change JWT_SECRET** in production
3. **Use strong passwords** for users
4. **Enable Supabase RLS** for production
5. **Use HTTPS** in production
6. **Keep dependencies updated**

---

## 🎉 Congratulations!

Your RealtyMatch system is now fully set up and ready to use!