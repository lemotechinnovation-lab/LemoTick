import { useAuthStore } from '@features/auth/stores/authStore';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export default function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
    const { isAuthenticated } = useAuthStore();

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
