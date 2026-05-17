import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface PublicNavigationProps {
    variant?: 'landing' | 'default';
}

function PublicNavigation({ variant = 'default' }: PublicNavigationProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    const navigationLinks = [
        { to: '/how-it-works', label: 'How It Works' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/markets', label: 'Markets' },
        { to: '/rules', label: 'Rules' },
        { to: '/about', label: 'About Us' },
        { to: '/partners', label: 'Partners' },
        { to: '/faq', label: 'FAQ' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Handle scroll effect for variant styling
    useEffect(() => {
        if (variant === 'landing') {
            const handleScroll = () => {
                setScrolled(window.scrollY > 20);
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [variant]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        closeMobileMenu();
    }, [location.pathname]);

    return (
        <>
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
                {navigationLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`text-base font-bold transition-all duration-300 relative group ${isActive(link.to)
                            ? 'text-white'
                            : variant === 'landing' && scrolled
                                ? 'text-gray-200 hover:text-white'
                                : 'text-gray-300 hover:text-white'
                            }`}
                        aria-current={isActive(link.to) ? 'page' : undefined}
                    >
                        {link.label}
                        <span
                            className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] transition-all duration-300 ${isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}
                            aria-hidden="true"
                        />
                    </Link>
                ))}
            </nav>

            {/* Mobile Hamburger Button - Visible on mobile only */}
            <button
                className="lg:hidden text-white hover:text-[#2F6BFF] transition-colors p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2 focus:ring-offset-[#0F0A2B] rounded-lg"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                        onClick={closeMobileMenu}
                        aria-hidden="true"
                    />

                    {/* Menu Panel */}
                    <div
                        id="mobile-menu"
                        className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0F0A2B]/98 backdrop-blur-xl border-l border-[#2F6BFF]/30 shadow-[0_0_50px_rgba(47,107,255,0.3)] overflow-y-auto animate-slideInRight"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#2F6BFF]/20">
                            <Link
                                to="/"
                                onClick={closeMobileMenu}
                                aria-label="LemoTick home"
                            >
                                <img
                                    src={logoFull}
                                    alt="LemoTick"
                                    className="h-12 w-auto object-contain brightness-125 contrast-150 saturate-110 drop-shadow-[0_0_20px_rgba(47,107,255,0.6)]"
                                />
                            </Link>
                            <button
                                onClick={closeMobileMenu}
                                className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-[#16124A]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]"
                                aria-label="Close navigation menu"
                            >
                                <X className="w-6 h-6" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="p-6 space-y-2" aria-label="Mobile navigation">
                            <h2 id="mobile-menu-title" className="sr-only">Navigation Menu</h2>
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={closeMobileMenu}
                                    className={`block px-5 py-3.5 rounded-xl text-base font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2 focus:ring-offset-[#0F0A2B] ${isActive(link.to)
                                        ? 'bg-gradient-to-r from-[#2F6BFF]/30 to-[#2F6BFF]/10 border-l-4 border-[#2F6BFF] text-white shadow-[0_0_20px_rgba(47,107,255,0.2)]'
                                        : 'text-gray-300 hover:text-white hover:bg-[#16124A]/60 hover:border-l-4 hover:border-[#2F6BFF]/50'
                                        }`}
                                    aria-current={isActive(link.to) ? 'page' : undefined}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Divider */}
                        <div className="mx-6 border-t border-[#2F6BFF]/20"></div>

                        {/* CTA Buttons */}
                        <div className="p-6 space-y-3">
                            <Link
                                to="/login"
                                onClick={closeMobileMenu}
                                className="block w-full text-center px-6 py-3.5 rounded-xl text-base font-bold text-white hover:text-[#2F6BFF] bg-[#16124A]/60 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] hover:bg-[#16124A] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2 focus:ring-offset-[#0F0A2B]"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                onClick={closeMobileMenu}
                                className="block w-full text-center px-6 py-4 rounded-xl text-base font-black text-white bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#2F6BFF] hover:to-[#FFA62B] shadow-[0_0_30px_rgba(47,107,255,0.5)] hover:shadow-[0_0_40px_rgba(255,166,43,0.6)] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[#FFA62B] focus:ring-offset-2 focus:ring-offset-[#0F0A2B]"
                            >
                                Get Started →
                            </Link>
                        </div>

                        {/* Footer Info */}
                        <div className="p-6 text-center text-sm text-gray-400 font-medium">
                            <p>© 2026 LemoTick. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PublicNavigation;


