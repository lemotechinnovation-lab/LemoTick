import { useAuthStore } from '@features/auth/stores/authStore';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0D0735] via-[#0B0633] to-[#16124A]/60">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#2F6BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#efdede]">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}


