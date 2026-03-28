import { useAuthStore } from '@features/auth/stores/authStore';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateWithToast, validationToast } from '../../../lib/validation-toast';
import { authService } from '../../../services/authService';

function Login() {
    const navigate = useNavigate();
    const { refreshAuthState } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setError('');

        // Prevent double submission with multiple checks
        if (isLoading || isSubmitting) return;

        // Validate form with toast feedback
        if (!validateWithToast.email(email)) return;
        if (!validateWithToast.required(password, 'Password')) return;

        // Set both loading states
        setIsLoading(true);
        setIsSubmitting(true);

        // Show loading toast and handle login
        const loginToast = validationToast.apiValidation('login');

        try {
            await authService.login({ email, password });
            // Refresh the auth store state after successful login
            refreshAuthState();

            // Update the existing toast to success (don't create a new one)
            loginToast.success('Login successful! Redirecting...');

            // Small delay to show success message before redirect
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed. Please check your credentials.';
            setError(''); // Clear the inline error since we're using toasts

            // Show user-friendly error toasts - only one toast per error
            if (err.message?.includes('Invalid credentials') || err.message?.includes('Unauthorized') || err.message?.includes('401')) {
                loginToast.error('Invalid email or password. Please check your credentials and try again.');
            } else if (err.message?.includes('Network') || err.message?.includes('fetch')) {
                loginToast.error('Connection problem. Please check your internet and try again.');
            } else if (err.message?.includes('timeout')) {
                loginToast.error('Request timed out. Please try again.');
            } else {
                loginToast.error('Unable to sign in. Please check your credentials and try again.');
            }
        } finally {
            setIsLoading(false);
            setIsSubmitting(false);
        }
    }, [email, password, isLoading, isSubmitting, navigate, refreshAuthState]);

    return (
        <div className="min-h-screen bg-[#0F0A2B] flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F0A2B] via-[#16124A] to-[#0F0A2B] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
                    <div className="animate-fadeIn text-center">
                        <img
                            src="/src/images/logo-full@2x.png"
                            alt="LemoTick"
                            className="h-48 w-auto object-contain mx-auto mb-6 brightness-125 contrast-150 saturate-110 drop-shadow-[0_0_20px_rgba(30,109,227,0.5)] hover:drop-shadow-[0_0_30px_rgba(30,109,227,0.7)] hover:scale-105 transition-all duration-300 scale-110"
                            style={{ imageRendering: 'crisp-edges' }}
                        />

                        {/* Tagline with better styling */}
                        <div className="mb-8 px-6">
                            <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#2F6BFF]/10 via-[#2F6BFF]/20 to-[#FFA62B]/10 border border-[#2F6BFF]/30 rounded-full backdrop-blur-sm">
                                <p className="text-xl font-semibold bg-gradient-to-r from-[#2F6BFF] via-[#3B82F6] to-[#FFA62B] bg-clip-text text-transparent">
                                    Smart Trading, Simplified
                                </p>
                            </div>
                        </div>

                        {/* Animated Robot */}
                        <div className="flex justify-center">
                            <svg className="w-48 h-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Robot Body */}
                                <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                                    {/* Main Body */}
                                    <rect x="60" y="80" width="80" height="90" rx="8" fill="url(#bodyGradient)" stroke="#2F6BFF" strokeWidth="2" />

                                    {/* Head */}
                                    <rect x="70" y="50" width="60" height="40" rx="6" fill="url(#headGradient)" stroke="#2F6BFF" strokeWidth="2" />

                                    {/* Antenna */}
                                    <line x1="100" y1="50" x2="100" y2="35" stroke="#2F6BFF" strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="100" cy="32" r="4" fill="#FFA62B" className="animate-pulse" />

                                    {/* Eyes */}
                                    <circle cx="85" cy="65" r="6" fill="#2F6BFF" className="animate-pulse" style={{ animationDuration: '2s' }} />
                                    <circle cx="115" cy="65" r="6" fill="#2F6BFF" className="animate-pulse" style={{ animationDuration: '2s' }} />

                                    {/* Mouth */}
                                    <path d="M 85 78 Q 100 83 115 78" stroke="#2F6BFF" strokeWidth="2" strokeLinecap="round" fill="none" />

                                    {/* Chest Panel */}
                                    <rect x="80" y="100" width="40" height="30" rx="4" fill="#16124A" stroke="#2F6BFF" strokeWidth="1" />
                                    <circle cx="90" cy="115" r="3" fill="#FFA62B" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                                    <circle cx="100" cy="115" r="3" fill="#2F6BFF" className="animate-pulse" style={{ animationDelay: '1s' }} />
                                    <circle cx="110" cy="115" r="3" fill="#FFA62B" className="animate-pulse" style={{ animationDelay: '1.5s' }} />

                                    {/* Arms */}
                                    <g className="origin-[60-100]" style={{ animation: 'wave 2s ease-in-out infinite' }}>
                                        <rect x="45" y="95" width="15" height="50" rx="4" fill="url(#armGradient)" stroke="#2F6BFF" strokeWidth="2" />
                                        <circle cx="52.5" cy="150" r="6" fill="#2F6BFF" />
                                    </g>
                                    <g className="origin-[140-100]" style={{ animation: 'wave 2s ease-in-out infinite', animationDelay: '1s' }}>
                                        <rect x="140" y="95" width="15" height="50" rx="4" fill="url(#armGradient)" stroke="#2F6BFF" strokeWidth="2" />
                                        <circle cx="147.5" cy="150" r="6" fill="#2F6BFF" />
                                    </g>

                                    {/* Legs */}
                                    <rect x="70" y="170" width="20" height="15" rx="3" fill="url(#legGradient)" stroke="#2F6BFF" strokeWidth="2" />
                                    <rect x="110" y="170" width="20" height="15" rx="3" fill="url(#legGradient)" stroke="#2F6BFF" strokeWidth="2" />
                                </g>

                                {/* Floating Particles */}
                                <circle cx="40" cy="100" r="2" fill="#2F6BFF" opacity="0.6" className="animate-ping" style={{ animationDuration: '3s' }} />
                                <circle cx="160" cy="120" r="2" fill="#FFA62B" opacity="0.6" className="animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                                <circle cx="50" cy="140" r="2" fill="#2F6BFF" opacity="0.6" className="animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />

                                {/* Gradients */}
                                <defs>
                                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#16124A" stopOpacity="0.8" />
                                    </linearGradient>
                                    <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#16124A" stopOpacity="0.9" />
                                    </linearGradient>
                                    <linearGradient id="armGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#16124A" stopOpacity="0.7" />
                                    </linearGradient>
                                    <linearGradient id="legGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#16124A" stopOpacity="0.7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 bg-[#0F0A2B]">
                <div className="w-full max-w-md animate-slideUp">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <img
                            src="/src/images/logo-full@2x.png"
                            alt="LemoTick"
                            className="h-12 w-auto object-contain brightness-125 contrast-150 saturate-110 drop-shadow-[0_0_12px_rgba(30,109,227,0.4)] scale-110"
                            style={{ imageRendering: 'crisp-edges' }}
                        />
                    </div>

                    <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#efdede] to-[#E6E9F2] bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">
                            Sign In
                        </h2>
                        <p className="text-sm text-gray-300">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-[#2F6BFF] hover:text-[#FFA62B] transition-colors underline decoration-[#2F6BFF]/30 hover:decoration-[#FFA62B]/50">
                                Create one
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 animate-slideDown backdrop-blur-sm">
                            <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                                <p className="text-xs text-red-200">{error}</p>
                            </div>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-gray-100 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-[#2F6BFF]/20 rounded-lg bg-[#16124A]/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:border-transparent transition-all text-sm hover:border-[#2F6BFF]/40 relative z-0"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold text-gray-100 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                    <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-[#2F6BFF]/20 rounded-lg bg-[#16124A]/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:border-transparent transition-all text-sm hover:border-[#2F6BFF]/40 relative z-0"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2 focus:ring-offset-[#0B0633] border-[#2F6BFF]/30 rounded-md bg-[#16124A]/50 backdrop-blur-sm cursor-pointer transition-all hover:border-[#2F6BFF]/60"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-gray-200 cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-xs">
                                <a href="#" className="font-semibold text-[#2F6BFF] hover:text-[#FFA62B] transition-colors underline decoration-[#2F6BFF]/30 hover:decoration-[#FFA62B]/50 underline-offset-2">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || isSubmitting}
                            className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#2F6BFF] via-[#2F6BFF] to-[#2557c9] hover:from-[#2F6BFF] hover:via-[#3B82F6] hover:to-[#FFA62B] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2 focus:ring-offset-[#0B0633] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#2F6BFF]/30 hover:shadow-xl hover:shadow-[#2F6BFF]/40 relative overflow-hidden group"
                        >
                            <span className="relative z-10">{isLoading || isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                    </form>

                    <div className="mt-5">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#2F6BFF]/20" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-[#0F0A2B] text-gray-300 font-medium">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="group flex items-center justify-center py-2 px-3 border border-[#2F6BFF]/20 rounded-lg bg-[#16124A]/50 backdrop-blur-sm text-gray-100 hover:bg-[#2F6BFF]/10 hover:border-[#2F6BFF]/50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg hover:shadow-[#2F6BFF]/20"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
                                </svg>
                                <span className="ml-2 text-xs font-medium">GitHub</span>
                            </button>

                            <button
                                type="button"
                                className="group flex items-center justify-center py-2 px-3 border border-[#2F6BFF]/20 rounded-lg bg-[#16124A]/50 backdrop-blur-sm text-gray-100 hover:bg-[#2F6BFF]/10 hover:border-[#2F6BFF]/50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg hover:shadow-[#2F6BFF]/20"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="ml-2 text-xs font-medium">Google</span>
                            </button>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
}

export default Login;
