# 🚀 LemoTick Frontend - Setup & Running Instructions

## ✅ What Has Been Created

### Core Files (Ready to Use)
```
frontend/
├── Configuration Files ✅
│   ├── package.json           # Dependencies configured
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vite.config.ts         # Vite build tool
│   ├── tailwind.config.js     # Tailwind CSS theme
│   ├── postcss.config.js      # PostCSS
│   ├── .eslintrc.cjs          # ESLint rules
│   ├── .gitignore             # Git exclusions
│   ├── index.html             # Main HTML
│   ├── env.example            # Environment variables
│   └── README.md              # Documentation
│
├── Source Code ✅
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Main app component
│   ├── index.css              # Global styles
│   │
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # All type definitions
│   │
│   ├── config/                # Configuration
│   │   └── constants.ts       # App constants
│   │
│   ├── utils/                 # Utilities
│   │   ├── format.ts          # Formatting functions
│   │   └── cn.ts              # Class name utility
│   │
│   ├── services/              # API Services
│   │   ├── api.ts             # Axios instance
│   │   └── authService.ts     # Auth service
│   │
│   ├── layouts/               # Layout Components
│   │   ├── AuthLayout.tsx     # Auth pages layout
│   │   ├── DashboardLayout.tsx# Dashboard layout
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── Header.tsx         # Top header
│   │
│   ├── components/            # Shared Components
│   │   └── common/
│   │       └── ProtectedRoute.tsx # Route guard
│   │
│   └── features/              # Feature Modules
│       ├── auth/              # Authentication
│       │   ├── stores/
│       │   │   └── authStore.ts     # Auth state
│       │   └── pages/
│       │       ├── LoginPage.tsx    # Login page
│       │       └── RegisterPage.tsx # Register page
│       │
│       ├── dashboard/         # Dashboard
│       │   └── pages/
│       │       └── DashboardPage.tsx
│       │
│       ├── portfolio/         # Portfolio Management
│       │   └── pages/
│       │       └── PortfolioPage.tsx
│       │
│       └── transactions/      # Transactions
│           └── pages/
│               └── TransactionsPage.tsx
│
└── Documentation ✅
    ├── README.md                    # Project overview
    ├── IMPLEMENTATION_GUIDE.md      # Complete guide
    └── SETUP_INSTRUCTIONS.md        # This file
```

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install all required packages:
- React 18 + React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router DOM
- TanStack Query
- Zustand (state management)
- Axios
- Lucide React (icons)
- Sonner (toasts)
- And more...

### Step 2: Configure Environment

```bash
# Copy the environment example file
cp env.example .env
```

Edit `.env` if needed (default values work with backend on localhost:5000):
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SIGNALR_HUB_URL=http://localhost:5000/notificationHub
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You'll be redirected to `/login`. Use the credentials from your backend to log in!

---

## 🏗️ Project Architecture

### Feature-Based Structure

Each feature is self-contained:
```
features/{feature-name}/
├── components/      # UI components
├── pages/          # Page components
├── hooks/          # Custom hooks
├── services/       # API calls
├── stores/         # State management
├── types/          # TypeScript types
└── index.ts        # Barrel export
```

### Path Aliases

Clean imports using `@` prefix:
```typescript
import { api } from '@services/api'
import { User } from '@types/index'
import { Button } from '@components/ui/Button'
import { useAuth } from '@features/auth/stores/authStore'
```

---

## 🎨 Tech Stack Details

### Core Technologies
- **React 18** - Latest React with Concurrent Features
- **TypeScript** - Type safety throughout
- **Vite** - Lightning fast HMR (Hot Module Replacement)
- **Tailwind CSS** - Utility-first CSS framework

### State Management
- **Zustand** - Simple, scalable state management (already used in auth)
- **TanStack Query** - Server state (cache, refetch, mutations)

### Routing
- **React Router v6** - Client-side routing with layouts

### UI/UX
- **Tailwind CSS** - Responsive utility classes
- **Lucide React** - Beautiful icon library
- **Sonner** - Elegant toast notifications

### Forms & Validation
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

---

## 📱 Available Pages

### ✅ Working Pages

1. **Login** (`/login`)
   - Email & password form
   - Remember me checkbox
   - Forgot password link
   - Link to register

2. **Register** (`/register`)
   - Full registration form
   - Personal details
   - ID verification
   - Referral code (optional)
   - Terms acceptance

3. **Dashboard** (`/dashboard`)
   - Summary cards (investment, profit, portfolios)
   - Performance chart placeholder
   - Recent activity list
   - Portfolio summary table

4. **Portfolio** (`/portfolio`)
   - Portfolio cards with metrics
   - Risk level badges
   - Create portfolio button
   - Empty state handling

5. **Transactions** (`/transactions`)
   - Transaction summary cards
   - Full transaction table
   - Status badges
   - Filter button (UI only)

### 🚧 To Be Implemented

These routes are defined but need pages created:
- `/bank-accounts` - Bank account management
- `/statements` - Financial statements
- `/referrals` - Referral program
- `/notifications` - Notification center
- `/preferences` - User settings
- `/help` - Help & support

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Type check (no emit)
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🔌 API Integration

### Current Setup

The API service is already configured with:
- Base URL from environment variable
- Automatic JWT token injection
- 401 (Unauthorized) handling
- Request/response interceptors
- Error normalization

### Using API in Components

```typescript
// Example: Fetching data with React Query
import { useQuery } from '@tanstack/react-query'
import { api } from '@services/api'

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-data'],
    queryFn: () => api.get('/api/endpoint')
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{JSON.stringify(data)}</div>
}
```

---

## 🎨 Styling Guide

### Tailwind Utility Classes

```typescript
// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Custom CSS classes (defined in index.css)
<div className="card">          {/* White card with shadow */}
<button className="btn-primary"> {/* Primary button */}
<input className="input">        {/* Styled input */}
<label className="label">        {/* Form label */}
```

### Custom Theme

Defined in `tailwind.config.js`:
- Primary: Blue (`primary-500`, `primary-600`, etc.)
- Success: Green
- Warning: Orange
- Danger: Red

---

## 🐛 Troubleshooting

### Issue: `npm install` fails

**Solution:**
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Change port in terminal
npm run dev -- --port 3001
```

Or edit `vite.config.ts`:
```typescript
server: {
  port: 3001,  // Change this
}
```

### Issue: TypeScript errors

**Solution:**
```bash
# Restart TypeScript server
# In VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# Or check for errors
npm run type-check
```

### Issue: Styles not applying

**Solution:**
1. Ensure `index.css` is imported in `main.tsx`
2. Check Tailwind directives are in `index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Issue: 401 Unauthorized on API calls

**Solution:**
- Ensure backend is running on `http://localhost:5000`
- Check if you're logged in (token in localStorage)
- Verify API endpoints match backend routes

### Issue: CORS errors

**Solution:**
The Vite proxy is configured. If issues persist:
1. Check `vite.config.ts` proxy configuration
2. Ensure backend allows CORS from `http://localhost:3000`

---

## 📚 Next Steps

### Immediate (Can Start Now)

1. **Run the Application**
   ```bash
   npm install
   npm run dev
   ```

2. **Test Login/Register**
   - Register a new account
   - Login with credentials
   - See dashboard with mock data

3. **Explore the Code**
   - Check `src/features/auth/` for auth implementation
   - See `src/features/dashboard/` for dashboard
   - Review `src/types/index.ts` for all types

### Short-term (This Week)

1. **Create Shared UI Components**
   - Button, Card, Input, Select, Dialog
   - Follow patterns in existing code
   - See `IMPLEMENTATION_GUIDE.md` for examples

2. **Connect Real API Data**
   - Replace mock data in dashboard
   - Create service files for each feature
   - Use TanStack Query for data fetching

3. **Add More Features**
   - Bank accounts page
   - Preferences page
   - Notifications
   - Statements

### Medium-term (This Month)

1. **Real-time Features**
   - SignalR integration (hook provided in guide)
   - Live notifications
   - Real-time trade updates

2. **Charts & Visualizations**
   - Install and use Recharts
   - Portfolio performance charts
   - Profit/loss visualizations

3. **Advanced Features**
   - KYC document upload
   - 2FA setup UI
   - Referral dashboard
   - Statement generation

---

## 🎓 Learning Resources

### Provided Documentation
- `README.md` - Project overview
- `IMPLEMENTATION_GUIDE.md` - Comprehensive guide with code examples
- `SETUP_INSTRUCTIONS.md` - This file

### External Resources
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TanStack Query Docs](https://tanstack.com/query)
- [Vite Guide](https://vitejs.dev/guide/)

---

## ✅ Checklist

Before starting development, ensure:

- [ ] Node.js 18+ is installed
- [ ] Backend API is running on port 5000
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Dev server running (`npm run dev`)
- [ ] Browser opened to `http://localhost:3000`
- [ ] Can successfully login/register

---

## 🆘 Getting Help

### Code Examples
All code follows consistent patterns. Check existing files:
- **Auth logic:** `src/features/auth/stores/authStore.ts`
- **Page layout:** `src/features/dashboard/pages/DashboardPage.tsx`
- **API calls:** `src/services/authService.ts`
- **Styling:** `src/index.css`

### Common Patterns

**Creating a new page:**
1. Create file in `src/features/{feature}/pages/MyPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/layouts/Sidebar.tsx`

**Creating a new API service:**
1. Create file in `src/services/myService.ts`
2. Use `api.get()`, `api.post()`, etc.
3. Return typed data

**Using state:**
```typescript
// Local state
const [value, setValue] = useState('')

// Global state (Zustand)
const user = useAuthStore((state) => state.user)

// Server state (React Query)
const { data } = useQuery({ queryKey: [...], queryFn: ... })
```

---

## 🎉 You're Ready!

The frontend foundation is complete and ready for development. Start with:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000` and start building!

For detailed implementation guidance, see `IMPLEMENTATION_GUIDE.md`.

---

**Happy Coding! 🚀**

