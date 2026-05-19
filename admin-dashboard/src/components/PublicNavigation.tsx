import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import logoFull from '../images/logo-full.png';
import logoFull2x from '../images/logo-full@2x.png';

interface PublicNavigationProps {
    variant?: 'landing' | 'default';
}

function PublicNavigation({ variant = 'default' }: PublicNavigationProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [animating, setAnimating] = useState(false);
    const location = useLocation();
    const panelRef = useRef<HTMLDivElement>(null);

    const navigationLinks = [
        { to: '/how-it-works', label: 'How It Works', emoji: '📚' },
        { to: '/pricing', label: 'Pricing', emoji: '💰' },
        { to: '/markets', label: 'Markets', emoji: '🌍' },
        { to: '/rules', label: 'Rules', emoji: '📋' },
        { to: '/about', label: 'About Us', emoji: '🏆' },
        { to: '/partners', label: 'Partners', emoji: '🤝' },
        { to: '/faq', label: 'FAQ', emoji: '❓' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const openMenu = () => {
        setMobileMenuOpen(true);
        setAnimating(true);
    };

    const closeMenu = () => {
        setAnimating(false);
        setTimeout(() => setMobileMenuOpen(false), 300);
    };

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    useEffect(() => { closeMenu(); }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) closeMenu();
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
                onClick={closeMenu}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    transition: 'opacity 0.3s ease',
                    opacity: animating ? 1 : 0,
                }}
            />

            {/* Slide-in Panel */}
            <div
                ref={panelRef}
                id="mobile-menu"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '360px',
                    background: 'linear-gradient(160deg, #0F0A2B 0%, #16124A 50%, #0F0A2B 100%)',
                    borderLeft: '1px solid rgba(47,107,255,0.25)',
                    boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
                    overflowY: 'auto',
                    zIndex: 10000,
                    transform: animating ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(47,107,255,0.15)',
                    background: 'rgba(47,107,255,0.05)',
                }}>
                    <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src={logoFull}
                            srcSet={`${logoFull} 1x, ${logoFull2x} 2x`}
                            alt="LemoTick"
                            style={{ height: 'auto', width: '120px', maxWidth: '40vw', objectFit: 'contain', imageRendering: 'crisp-edges' }}
                        />
                    </Link>
                    <button
                        onClick={closeMenu}
                        aria-label="Close navigation menu"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav style={{ padding: '8px 12px', flex: 1 }} aria-label="Mobile navigation">
                    <h2 id="mobile-menu-title" className="sr-only">Navigation Menu</h2>
                    {/* Section label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px 10px' }}>
                        <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'linear-gradient(180deg, #2F6BFF, #FFA62B)' }} />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFA62B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            Navigation
                        </span>
                    </div>
                    {navigationLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={closeMenu}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: isActive(link.to) ? 800 : 600,
                                color: isActive(link.to) ? 'white' : 'rgba(255,255,255,0.85)',
                                background: isActive(link.to) ? 'linear-gradient(135deg, rgba(47,107,255,0.25), rgba(47,107,255,0.1))' : 'rgba(255,255,255,0.03)',
                                border: isActive(link.to) ? '1px solid rgba(47,107,255,0.5)' : '1px solid rgba(255,255,255,0.06)',
                                textDecoration: 'none',
                                marginBottom: '4px',
                                transition: 'all 0.15s',
                                boxShadow: isActive(link.to) ? '0 2px 12px rgba(47,107,255,0.2)' : 'none',
                            }}
                        >
                            <span style={{ fontSize: '16px', lineHeight: 1 }}>{link.emoji}</span>
                            <span>{link.label}</span>
                            {isActive(link.to) && (
                                <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#2F6BFF', boxShadow: '0 0 8px #2F6BFF' }} />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Divider */}
                <div style={{ margin: '0 16px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(47,107,255,0.3), transparent)' }} />

                {/* CTA Buttons */}
                <div style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Section label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px 4px' }}>
                        <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'linear-gradient(180deg, #2F6BFF, #FFA62B)' }} />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFA62B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            Account
                        </span>
                    </div>
                    <Link
                        to="/login"
                        onClick={closeMenu}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '11px 20px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: 'white',
                            background: 'rgba(47,107,255,0.12)',
                            border: '1px solid rgba(47,107,255,0.5)',
                            textDecoration: 'none',
                            boxShadow: '0 2px 12px rgba(47,107,255,0.15)',
                        }}
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        onClick={closeMenu}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '11px 20px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 900,
                            color: 'white',
                            background: 'linear-gradient(135deg, #2F6BFF, #3B82F6)',
                            boxShadow: '0 4px 20px rgba(47,107,255,0.45)',
                            textDecoration: 'none',
                            letterSpacing: '0.01em',
                        }}
                    >
                        🚀 Get Started Free
                    </Link>
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 16px 14px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.6)', display: 'inline-block' }} />
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>All Systems Operational</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>© 2026 LemoTick. All rights reserved.</p>
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
                        className={`text-base font-bold transition-all duration-300 relative group ${isActive(link.to) ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                        aria-current={isActive(link.to) ? 'page' : undefined}
                    >
                        {link.label}
                        <span
                            className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] transition-all duration-300 ${isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'}`}
                            aria-hidden="true"
                        />
                    </Link>
                ))}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
                className="lg:hidden flex items-center justify-center"
                onClick={openMenu}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(47,107,255,0.15)',
                    border: '1px solid rgba(47,107,255,0.35)',
                    color: 'white',
                    cursor: 'pointer',
                    flexShrink: 0,
                }}
            >
                <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile Menu — rendered via portal to escape backdrop-blur stacking context */}
            {createPortal(mobileMenu, document.body)}
        </>
    );
}

export default PublicNavigation;
