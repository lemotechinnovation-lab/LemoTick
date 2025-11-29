# 🚀 LemoTick Frontend - Complete Implementation Guide

**Status:** Foundation Complete | Ready for Development  
**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS

---

## ✅ What's Been Created

### 1. **Project Configuration** ✓
- ✅ `package.json` - All dependencies configured
- ✅ `tsconfig.json` - TypeScript with path aliases
- ✅ `vite.config.ts` - Fast build tool with proxy
- ✅ `tailwind.config.js` - Custom theme
- ✅ `postcss.config.js` - PostCSS setup
- ✅ `.eslintrc.cjs` - Code quality rules
- ✅ `index.html` - Main HTML template
- ✅ `.gitignore` - Git exclusions
- ✅ `env.example` - Environment variables template
- ✅ `README.md` - Project documentation

### 2. **Core Types** ✓
- ✅ `src/types/index.ts` - Complete TypeScript definitions
  - User & Auth types
  - Portfolio & Trade types
  - Transaction types
  - Notification types
  - Bank Account types
  - Preferences types
  - Dashboard types
  - API types

### 3. **Configuration** ✓
- ✅ `src/config/constants.ts` - App constants & configuration

### 4. **Utilities** ✓
- ✅ `src/utils/format.ts` - Formatting functions
- ✅ `src/utils/cn.ts` - Class name utility

### 5. **API Services** ✓
- ✅ `src/services/api.ts` - Axios instance with interceptors
- ✅ `src/services/authService.ts` - Authentication service

---

## 📦 Installation & Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Start development server
npm run dev
```

The app will run on `http://localhost:3000` with API proxy to `http://localhost:5000`

---

## 🏗️ Remaining Files to Create

### Priority 1: Core Application Files

#### 1. Main Entry Point
**File:** `src/main.tsx`
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
```

#### 2. Global Styles
**File:** `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .container-custom {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  }
}
```

#### 3. App Component
**File:** `src/App.tsx`
```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@features/auth/stores/authStore'

// Layouts
import AuthLayout from '@layouts/AuthLayout'
import DashboardLayout from '@layouts/DashboardLayout'

// Pages
import LoginPage from '@features/auth/pages/LoginPage'
import RegisterPage from '@features/auth/pages/RegisterPage'
import DashboardPage from '@features/dashboard/pages/DashboardPage'
import PortfolioPage from '@features/portfolio/pages/PortfolioPage'
// ... more imports

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            {/* Add more routes */}
          </Route>
        </Route>

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      
      <Toaster position="top-right" />
    </>
  )
}

export default App
```

---

### Priority 2: Feature Modules

Each feature follows this structure:
```
features/{feature-name}/
├── components/          # Feature-specific components
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API calls
├── stores/             # State management (Zustand)
├── types/              # TypeScript types
└── index.ts            # Barrel export
```

#### Authentication Feature
**Folder:** `src/features/auth/`

**Files to create:**
1. `stores/authStore.ts` - Zustand auth state
2. `hooks/useAuth.ts` - Auth hook
3. `pages/LoginPage.tsx` - Login page
4. `pages/RegisterPage.tsx` - Register page
5. `components/LoginForm.tsx` - Login form
6. `components/RegisterForm.tsx` - Register form

**Example Auth Store:**
```typescript
// features/auth/stores/authStore.ts
import { create } from 'zustand'
import { User } from '@types/index'
import { authService } from '@services/authService'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  
  login: async (email, password) => {
    const response = await authService.login({ email, password })
    set({ user: response.user, isAuthenticated: true })
  },
  
  logout: () => {
    authService.logout()
    set({ user: null, isAuthenticated: false })
  },
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}))
```

#### Dashboard Feature
**Folder:** `src/features/dashboard/`

**Files to create:**
1. `pages/DashboardPage.tsx` - Main dashboard
2. `components/SummaryCards.tsx` - KPI cards
3. `components/PerformanceChart.tsx` - Chart component
4. `components/RecentActivity.tsx` - Activity list
5. `services/dashboardService.ts` - API calls
6. `hooks/useDashboard.ts` - Dashboard data hook

#### Portfolio Feature
**Folder:** `src/features/portfolio/`

**Files to create:**
1. `pages/PortfolioPage.tsx` - Portfolio overview
2. `components/PortfolioList.tsx` - Portfolio cards
3. `components/PortfolioDetails.tsx` - Details modal
4. `services/portfolioService.ts` - API calls
5. `hooks/usePortfolio.ts` - Portfolio data hook

#### Transactions Feature
**Folder:** `src/features/transactions/`

**Files to create:**
1. `pages/TransactionsPage.tsx` - Transaction list
2. `components/TransactionTable.tsx` - Data table
3. `components/TransactionFilters.tsx` - Filter UI
4. `services/transactionService.ts` - API calls

#### Bank Accounts Feature
**Folder:** `src/features/bank-accounts/`

**Files to create:**
1. `pages/BankAccountsPage.tsx` - Bank accounts list
2. `components/BankAccountCard.tsx` - Account card
3. `components/AddBankAccountModal.tsx` - Add form
4. `services/bankAccountService.ts` - API calls

#### Preferences Feature
**Folder:** `src/features/preferences/`

**Files to create:**
1. `pages/PreferencesPage.tsx` - Settings page
2. `components/NotificationSettings.tsx` - Notification prefs
3. `components/DisplaySettings.tsx` - Display prefs
4. `services/preferencesService.ts` - API calls

---

### Priority 3: Shared Components

**Folder:** `src/components/ui/`

Essential UI components (use Radix UI primitives):
1. `Button.tsx` - Button component
2. `Card.tsx` - Card component
3. `Input.tsx` - Input field
4. `Select.tsx` - Dropdown select
5. `Dialog.tsx` - Modal dialog
6. `Table.tsx` - Data table
7. `Badge.tsx` - Status badge
8. `Tabs.tsx` - Tab component
9. `Switch.tsx` - Toggle switch
10. `Toast.tsx` - Notification toast

**Example Button Component:**
```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'border-2 border-gray-300 hover:border-gray-400': variant === 'outline',
            'hover:bg-gray-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    )
  }
)
```

**Folder:** `src/components/common/`

Common components:
1. `Loading.tsx` - Loading spinner
2. `Error.tsx` - Error display
3. `EmptyState.tsx` - Empty state UI
4. `Pagination.tsx` - Pagination controls
5. `SearchInput.tsx` - Search field

---

### Priority 4: Layouts

**Folder:** `src/layouts/`

#### Auth Layout
**File:** `AuthLayout.tsx`
```typescript
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white">LemoTick</h1>
            <p className="text-primary-100">Investor Management Portal</p>
          </div>
          
          <div className="rounded-lg bg-white p-8 shadow-xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### Dashboard Layout
**File:** `DashboardLayout.tsx`
```typescript
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

---

### Priority 5: Hooks

**Folder:** `src/hooks/`

Essential custom hooks:
1. `useAuth.ts` - Authentication
2. `useDebounce.ts` - Debounce values
3. `useLocalStorage.ts` - Local storage
4. `useMediaQuery.ts` - Responsive breakpoints
5. `useSignalR.ts` - Real-time notifications

**Example useSignalR Hook:**
```typescript
// hooks/useSignalR.ts
import { useEffect, useRef } from 'use'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { SIGNALR_HUB_URL } from '@config/constants'

export function useSignalR() {
  const connectionRef = useRef<HubConnection | null>(null)

  const connect = async () => {
    const connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL)
      .withAutomaticReconnect()
      .build()

    await connection.start()
    connectionRef.current = connection
  }

  const disconnect = async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop()
    }
  }

  const on = (eventName: string, callback: (...args: any[]) => void) => {
    connectionRef.current?.on(eventName, callback)
  }

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return { connect, disconnect, on }
}
```

---

## 🎨 Design System

### Colors
```javascript
primary: Blue (#3b82f6)
success: Green (#22c55e)
warning: Orange (#f59e0b)
danger: Red (#ef4444)
```

### Typography
```
Font Family: Inter
Headings: font-bold
Body: font-normal
```

### Spacing
```
Use Tailwind spacing scale:
- p-4 (1rem)
- p-6 (1.5rem)
- p-8 (2rem)
```

---

## 🔌 API Integration Pattern

### Using React Query

```typescript
// In any component
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioService } from '@features/portfolio/services/portfolioService'
import { QUERY_KEYS } from '@config/constants'

function PortfolioComponent() {
  const queryClient = useQueryClient()

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.PORTFOLIO,
    queryFn: () => portfolioService.getPortfolio()
  })

  // Mutate data
  const mutation = useMutation({
    mutationFn: portfolioService.updatePortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO })
    }
  })

  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />

  return <div>{/* Render data */}</div>
}
```

---

## 📱 Responsive Design

Use Tailwind breakpoints:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🧪 Development Workflow

1. **Create Feature**
   ```bash
   mkdir -p src/features/new-feature/{components,hooks,pages,services}
   ```

2. **Create Service**
   ```typescript
   // services/newService.ts
   class NewService {
     async getData() {
       return api.get('/api/endpoint')
     }
   }
   export const newService = new NewService()
   ```

3. **Create Hook**
   ```typescript
   // hooks/useNewData.ts
   export function useNewData() {
     return useQuery({
       queryKey: ['new-data'],
       queryFn: () => newService.getData()
     })
   }
   ```

4. **Create Component**
   ```typescript
   // components/NewComponent.tsx
   export function NewComponent() {
     const { data } = useNewData()
     return <div>{data}</div>
   }
   ```

5. **Add Route**
   ```typescript
   <Route path="/new" element={<NewPage />} />
   ```

---

## 📚 Next Steps

### Immediate Tasks:
1. ✅ Run `npm install` in frontend folder
2. ✅ Create `.env` file from `env.example`
3. ✅ Create `src/main.tsx` and `src/App.tsx`
4. ✅ Create `src/index.css`
5. ✅ Build auth feature (login/register)
6. ✅ Create dashboard page
7. ✅ Add remaining features incrementally

### Development Order:
1. **Week 1:** Auth + Dashboard
2. **Week 2:** Portfolio + Transactions
3. **Week 3:** Bank Accounts + Preferences
4. **Week 4:** Polish + Testing

---

## 🎯 Success Criteria

- ✅ User can login/register
- ✅ Dashboard shows portfolio summary
- ✅ User can view transactions
- ✅ User can manage bank accounts
- ✅ User can update preferences
- ✅ Real-time notifications work
- ✅ Responsive on mobile
- ✅ Accessible (keyboard navigation)

---

## 🆘 Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Vite proxy is configured. Ensure backend runs on port 5000.

### Issue: 401 Unauthorized
**Solution:** Check if token is stored and sent in headers.

### Issue: Types Not Found
**Solution:** Restart TypeScript server or VS Code.

### Issue: Styles Not Applied
**Solution:** Ensure Tailwind directives in `index.css`.

---

## 📖 Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [Radix UI](https://www.radix-ui.com)
- [Zustand](https://zustand-demo.pmnd.rs)

---

**Status:** ✅ Foundation Complete  
**Next:** Implement features following this guide  
**Estimated Time:** 2-4 weeks for full implementation

