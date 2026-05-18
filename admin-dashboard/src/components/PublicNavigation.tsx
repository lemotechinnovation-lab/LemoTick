import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import logoFull from '../images/logo-full@2x.png';

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

    useEffect(() => {
        if (variant === 'landing') {
            const handleScroll = () => setScrolled(window.scrollY > 20);
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [variant]);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    useEffect(() => { closeMobileMenu(); }, [location.pathname]);

    // Close menu when resizing to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) closeMobileMenu();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobileMenu = mobileMenuOpen ? (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
        >
            {/* Backdrop */}
            <div
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)' }}
                onClick={closeMobileMenu}
                aria-hidden="true"
            />

            {/* Menu Panel */}
            <div
                id="mobile-menu"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '320px',
                    maxWidth: '85vw',
                    background: '#0F0A2B',
                    borderLeft: '1px solid rgba(47,107,255,0.3)',
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                    overflowY: 'auto',
                    zIndex: 10000,
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(47,107,255,0.2)' }}>
                    <Link to="/" onClick={closeMobileMenu}>
                        <img src={logoFull} alt="LemoTick" style={{ height: '40px', width: 'auto' }} />
                    </Link>
                    <button
                        onClick={closeMobileMenu}
                        style={{ color: 'white', padding: '8px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        aria-label="Close navigation menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }} aria-label="Mobile navigation">
                    <h2 id="mobile-menu-title" className="sr-only">Navigation Menu</h2>
                    {navigationLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={closeMobileMenu}
                            style={{
                                display: 'block',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 700,
                                color: isActive(link.to) ? 'white' : '#D1D5DB',
                                background: isActive(link.to) ? 'rgba(47,107,255,0.2)' : 'transparent',
                                borderLeft: isActive(link.to) ? '4px solid #2F6BFF' : '4px solid transparent',
                                textDecoration: 'none',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ margin: '0 24px', borderTop: '1px solid rgba(47,107,255,0.2)' }} />

                {/* CTA Buttons */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        style={{ display: 'block', textAlign: 'center', padding: '14px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, color: 'white', background: 'rgba(22,18,74,0.6)', border: '1px solid rgba(47,107,255,0.3)', textDecoration: 'none' }}
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        onClick={closeMobileMenu}
                        style={{ display: 'block', textAlign: 'center', padding: '16px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 900, color: 'white', background: 'linear-gradient(to right, #2F6BFF, #3B82F6)', textDecoration: 'none' }}
                    >
                        Get Started →
                    </Link>
                </div>

                <div style={{ padding: '24px', textAlign: 'center', fontSize: '14px', color: '#9CA3AF' }}>
                    <p>© 2026 LemoTick. All rights reserved.</p>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
                {navigationLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`text-base font-bold transition-all duration-300 relative group ${isActive(link.to) ? 'text-white' : 'text-gray-300 hover:text-white'
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

            {/* Mobile Hamburger Button */}
            <button
                className="lg:hidden"
                style={{ color: 'white', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', minWidth: '44px', minHeight: '44px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
            >
                <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile Menu — rendered via portal to escape backdrop-blur stacking context */}
            {createPortal(mobileMenu, document.body)}
        </>
    );
}

export default PublicNavigation;
