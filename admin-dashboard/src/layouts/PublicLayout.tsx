import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PublicNavigation from '../components/PublicNavigation';

interface PublicLayoutProps {
    children: ReactNode;
}

function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-r from-[#c5c5d0] via-[#9090a8] to-[#6b6b88] relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(47, 107, 255, 0.4) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}></div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-[#35335e]/95 backdrop-blur-xl border-b border-[#35335e] shadow-sm z-50">
                {/* Subtle accent line at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2F6BFF]/30 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div>
                            {/* Logo */}
                            <Link to="/" className="flex items-center group shrink-0 transition-transform hover:scale-105">
                                <img
                                    src={logoFull}
                                    alt="LemoTick"
                                    className="drop-shadow-sm"
                                    style={{ imageRendering: 'crisp-edges', height: 'auto', width: 'auto', maxWidth: '180px' }}
                                />
                            </Link>
                        </div>

                        {/* Navigation Links - Desktop & Mobile Menu */}
                        <PublicNavigation />

                        {/* CTA Buttons - Hidden on mobile, shown on desktop */}
                        <div className="hidden lg:flex items-center space-x-4 shrink-0">
                            <Link
                                to="/login"
                                className="text-white hover:text-[#2F6BFF] px-5 py-2.5 text-base font-bold transition-all duration-300 hover:scale-105 relative group"
                            >
                                Sign In
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] group-hover:w-full transition-all duration-300"></span>
                            </Link>
                            <Link
                                to="/register"
                                className="relative bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#2F6BFF] hover:to-[#FFA62B] text-white px-6 py-3 rounded-xl text-base font-black transition-all duration-500 shadow-[0_0_30px_rgba(47,107,255,0.4)] hover:shadow-[0_0_40px_rgba(255,166,43,0.5)] transform hover:scale-110 overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative pt-20 pb-16">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative bg-[#35335e] border-t border-[#35335e] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Subtle background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-[#2F6BFF] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFA62B] rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto z-10">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div>
                            <img
                                src={logoFull}
                                alt="LemoTick"
                                className="h-16 w-auto mb-6 drop-shadow-sm"
                                style={{ imageRendering: 'crisp-edges', height: 'auto', width: 'auto', maxWidth: '180px' }}
                            />
                            <p className="text-base text-gray-300 font-medium leading-relaxed mb-6">
                                South Africa's most transparent prop firm. Trade with our capital, keep 80% of profits.
                            </p>
                            {/* Social Links */}
                            <div className="flex gap-3">
                                <a href="#" className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 hover:border-[#2F6BFF] hover:bg-[#2F6BFF]/20 flex items-center justify-center text-gray-300 hover:text-[#2F6BFF] transition-all duration-300 hover:scale-110">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="#" className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 hover:border-[#2F6BFF] hover:bg-[#2F6BFF]/20 flex items-center justify-center text-gray-300 hover:text-[#2F6BFF] transition-all duration-300 hover:scale-110">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </a>
                                <a href="#" className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 hover:border-[#2F6BFF] hover:bg-[#2F6BFF]/20 flex items-center justify-center text-gray-300 hover:text-[#2F6BFF] transition-all duration-300 hover:scale-110">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white mb-6 relative inline-block">
                                Product
                                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] rounded-full"></span>
                            </h4>
                            <ul className="space-y-3">
                                <li><Link to="/how-it-works" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">How It Works</Link></li>
                                <li><Link to="/pricing" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Pricing</Link></li>
                                <li><Link to="/markets" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Markets</Link></li>
                                <li><Link to="/rules" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Rules</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white mb-6 relative inline-block">
                                Company
                                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] rounded-full"></span>
                            </h4>
                            <ul className="space-y-3">
                                <li><Link to="/about" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">About</Link></li>
                                <li><a href="#" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Blog</a></li>
                                <li><a href="#" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Careers</a></li>
                                <li><a href="#" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Press</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white mb-6 relative inline-block">
                                Support
                                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] rounded-full"></span>
                            </h4>
                            <ul className="space-y-3">
                                <li><Link to="/faq" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">FAQ</Link></li>
                                <li><Link to="/partners" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Partners</Link></li>
                                <li><a href="#" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Contact</a></li>
                                <li><a href="#" className="text-base text-white font-medium hover:text-[#2F6BFF] transition-all duration-300 hover:translate-x-1 inline-block">Support</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/20">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-base text-white font-medium">
                                &copy; 2026 <span className="text-[#2F6BFF] font-bold">LemoTick</span>. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2 text-sm text-white font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                    All Systems Operational
                                </span>
                                <a href="#" className="text-sm text-white font-medium hover:text-[#2F6BFF] transition-colors">Status</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default PublicLayout;


