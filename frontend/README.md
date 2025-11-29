# LemoTick Investor Portal

Modern, feature-rich investor management portal built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Dashboard** - Real-time portfolio overview with performance metrics
- **Portfolio Management** - Track investments, trades, and transactions
- **Real-time Updates** - Live notifications via SignalR
- **Bank Account Management** - Secure deposit and withdrawal operations
- **Investor Preferences** - Customizable settings and notifications
- **KYC/Compliance** - Document upload and verification
- **Referral System** - Track referrals and commissions
- **2FA Support** - Enhanced security with two-factor authentication
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Radix UI** - Accessible components
- **SignalR** - Real-time communication

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── features/        # Feature-based modules
│   │   ├── auth/        # Authentication
│   │   ├── dashboard/   # Dashboard
│   │   ├── portfolio/   # Portfolio management
│   │   ├── transactions/# Transactions
│   │   ├── bank-accounts/ # Bank accounts
│   │   ├── preferences/ # Settings
│   │   └── kyc/         # KYC documents
│   ├── components/      # Shared components
│   │   ├── ui/          # UI primitives
│   │   └── common/      # Common components
│   ├── layouts/         # Layout components
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── config/          # Configuration
│   └── assets/          # Images, fonts, etc.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running on `http://localhost:5000`

### Installation

1. Clone the repository and navigate to frontend folder
2. Copy environment variables:
   ```bash
   cp env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open browser at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SIGNALR_HUB_URL=http://localhost:5000/notificationHub
```

### API Proxy

The development server is configured to proxy API requests to avoid CORS issues:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

## 📚 Code Organization

### Feature-Based Architecture

Each feature is self-contained with its own:
- Components
- Hooks
- Services
- Types
- Utils

Example:
```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   └── authService.ts
├── types/
│   └── authTypes.ts
└── index.ts
```

### Absolute Imports

Use path aliases for clean imports:

```typescript
import { Button } from '@components/ui/Button'
import { useAuth } from '@features/auth/hooks/useAuth'
import { api } from '@services/api'
```

## 🎨 Styling

### Tailwind CSS

Utility-first CSS framework with custom theme:

```tsx
<div className="bg-primary-500 text-white p-4 rounded-lg">
  Hello World
</div>
```

### Component Library

Built on Radix UI for accessibility:
- Dialogs
- Dropdowns
- Selects
- Tabs
- Toasts
- Switches

## 🔐 Authentication

### JWT-based Authentication

Stored in localStorage with automatic refresh:

```typescript
const { login, logout, user, isAuthenticated } = useAuth()
```

### Protected Routes

```typescript
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

## 📡 API Integration

### Axios Instance

Configured with interceptors:

```typescript
import { api } from '@services/api'

const data = await api.get('/investors')
```

### React Query

Server state management:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['portfolio'],
  queryFn: () => portfolioService.getPortfolio()
})
```

## 🔔 Real-time Updates

### SignalR Integration

```typescript
const { connect, disconnect, on } = useSignalR()

useEffect(() => {
  connect()
  on('ReceiveNotification', handleNotification)
  return () => disconnect()
}, [])
```

## 🧪 Best Practices

- ✅ TypeScript strict mode
- ✅ ESLint for code quality
- ✅ Feature-based folder structure
- ✅ Custom hooks for reusability
- ✅ Error boundaries
- ✅ Loading states
- ✅ Optimistic updates
- ✅ Accessible components
- ✅ Responsive design
- ✅ Performance optimizations

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

Output: `dist/` directory

### Preview Build

```bash
npm run preview
```

### Deploy

Deploy the `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps
- Any static hosting

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for type safety
3. Write meaningful component and variable names
4. Keep components small and focused
5. Use custom hooks for complex logic
6. Add proper error handling
7. Test in multiple browsers

## 📄 License

Copyright © 2025 LemoTick. All rights reserved.

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ using React + TypeScript**

