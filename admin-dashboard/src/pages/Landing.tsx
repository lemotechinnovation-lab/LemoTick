import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F0A2B] via-[#0F0A2B] to-[#1A1450]/60 relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(47, 107, 255, 0.15) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}></div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-gradient-to-r from-[#1A1547]/95 via-[#1E1B52]/95 to-[#1A1547]/95 backdrop-blur-md border-b border-[#2F6BFF]/30 shadow-[0_4px_20px_rgba(30,109,227,0.15)] z-50 relative">
                {/* Subtle glow effect at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2F6BFF]/50 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <img
                                src="/src/images/logo-full@2x.png"
                                alt="LemoTick"
                                className="h-14 w-auto max-w-[180px] object-contain brightness-125 contrast-150 saturate-110 drop-shadow-[0_0_12px_rgba(30,109,227,0.4)] hover:drop-shadow-[0_0_16px_rgba(30,109,227,0.6)] hover:scale-[1.65] transition-all duration-200 scale-[1.6]"
                                style={{ imageRendering: 'crisp-edges' }}
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-gray-100 hover:text-[#2F6BFF] px-3 py-2 text-body-dashboard font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-[#2F6BFF] to-[#2F6BFF] hover:from-[#2F6BFF] hover:to-[#FFA62B] text-white px-4 py-2 rounded-xl text-body-dashboard font-semibold transition-all duration-300 shadow-lg shadow-[#2F6BFF]/30"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#2F6BFF]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFA62B]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative max-w-7xl mx-auto text-center z-10">
                    <div className="inline-block mb-6">
                        <span className="px-4 py-2 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-body-dashboard text-[#2F6BFF] font-semibold backdrop-blur-sm">
                            🚀 Welcome to the Future of Trading
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="block bg-gradient-to-r from-[#efdede] via-[#B8BEC9] to-[#efdede] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(160,167,181,0.4)]">
                            Smart Trading Platform
                        </span>
                        <span className="block mt-3 bg-gradient-to-r from-[#2F6BFF] via-[#3B82F6] to-[#FFA62B] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(47,107,255,0.5)]">
                            Built for Modern Traders
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Trade with confidence. Track analytics, monitor performance, and make data-driven decisions with our
                        <span className="text-[#2F6BFF] font-semibold"> intuitive trading platform</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="bg-gradient-to-r from-[#2F6BFF] to-[#2F6BFF] hover:from-[#2F6BFF] hover:to-[#FFA62B] text-white px-8 py-3 rounded-xl text-card-title font-semibold shadow-lg shadow-[#2F6BFF]/30 hover:shadow-[#2F6BFF]/50 transition-all duration-300 transform hover:scale-105"
                        >
                            Start Free Trial
                        </Link>
                        <Link
                            to="/dashboard"
                            className="bg-[#16124A] hover:bg-[#2F6BFF]/10 text-gray-100 px-8 py-3 rounded-xl text-card-title font-semibold border border-[#2F6BFF]/30 hover:border-[#2F6BFF] shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            View Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#16124A]/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-small-dashboard text-[#2F6BFF] font-semibold mb-4">
                            Features
                        </span>
                        <h2 className="text-page-title text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-4">
                            Everything you need to succeed
                        </h2>
                        <p className="text-card-title text-gray-200 max-w-2xl mx-auto">
                            Powerful features designed to help you trade smarter and grow your portfolio faster
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300 hover-lift">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">
                                Real-time Analytics
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Track your metrics in real-time with beautiful, interactive charts and graphs.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300 hover-lift">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">
                                Automated Trading
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Set up trading bots with custom strategies and let them work for you 24/7.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300 hover-lift">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">
                                Secure & Reliable
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Enterprise-grade security with 99.9% uptime guarantee and data encryption.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300 hover-lift">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">
                                Advanced Indicators
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Access 20+ technical indicators and drawing tools for comprehensive analysis.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300 hover-lift">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">
                                Lightning Fast
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Optimized performance ensures your trades execute instantly, every time.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300 hover-lift">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">
                                Mobile Ready
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Trade anywhere with our fully responsive mobile design and native apps.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#2F6BFF]/10 to-[#FFA62B]/10 border-y border-[#2F6BFF]/20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-2 font-tabular">10K+</div>
                            <div className="text-body-dashboard text-gray-200">Active Traders</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-2 font-tabular">R2.5B+</div>
                            <div className="text-body-dashboard text-gray-200">Trading Volume</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-2 font-tabular">150+</div>
                            <div className="text-body-dashboard text-gray-200">Countries</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-2 font-tabular">99.9%</div>
                            <div className="text-body-dashboard text-gray-200">Uptime</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0633]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-small-dashboard text-[#2F6BFF] font-semibold mb-4">
                            Testimonials
                        </span>
                        <h2 className="text-page-title text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-4">
                            Trusted by traders worldwide
                        </h2>
                        <p className="text-card-title text-gray-200 max-w-2xl mx-auto">
                            See what our community has to say about their trading experience
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16124A] to-[#0B0633] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300 hover-lift">
                            <div className="flex items-center mb-4">
                                <div className="flex text-[#FFA62B]">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <p className="text-body-dashboard text-gray-200 mb-4">
                                "LemoTick has completely transformed my trading strategy. The automated bots are incredibly reliable and the analytics are top-notch."
                            </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">
                                    JD
                                </div>
                                <div className="ml-3">
                                    <div className="text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)]">John Doe</div>
                                    <div className="text-small-dashboard text-gray-200">Professional Trader</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16124A] to-[#0B0633] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300 hover-lift">
                            <div className="flex items-center mb-4">
                                <div className="flex text-[#FFA62B]">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <p className="text-body-dashboard text-gray-200 mb-4">
                                "The best trading platform I've used. Real-time data, intuitive interface, and excellent customer support. Highly recommended!"
                            </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">
                                    SM
                                </div>
                                <div className="ml-3">
                                    <div className="text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)]">Sarah Miller</div>
                                    <div className="text-small-dashboard text-gray-200">Day Trader</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16124A] to-[#0B0633] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300 hover-lift">
                            <div className="flex items-center mb-4">
                                <div className="flex text-[#FFA62B]">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <p className="text-body-dashboard text-gray-200 mb-4">
                                "I've increased my portfolio by 40% in just 3 months. The platform's features and tools are exactly what I needed."
                            </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">
                                    MK
                                </div>
                                <div className="ml-3">
                                    <div className="text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)]">Michael Kim</div>
                                    <div className="text-small-dashboard text-gray-200">Crypto Investor</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0D0735] via-[#0B0633] to-[#16124A]/60">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-small-dashboard text-[#2F6BFF] font-semibold mb-4">
                            Pricing
                        </span>
                        <h2 className="text-page-title text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-4">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-card-title text-gray-200 max-w-2xl mx-auto">
                            Choose the perfect plan for your trading needs. All plans include 14-day free trial
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Starter Plan */}
                        <div className="p-8 rounded-2xl border border-[#2F6BFF]/20 bg-[#16124A] hover:border-[#2F6BFF] transition-all duration-300">
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">Starter</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] font-tabular">R29</span>
                                <span className="text-body-dashboard text-gray-200">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Up to 5 trading bots
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Basic analytics
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    10+ technical indicators
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Email support
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-[#0B0633] hover:bg-[#2F6BFF]/10 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-gray-100 px-6 py-3 rounded-xl text-body-dashboard font-semibold transition-all duration-300"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="p-8 rounded-2xl border-2 border-[#2F6BFF] bg-[#16124A] relative shadow-lg shadow-[#2F6BFF]/20">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-4 py-1 rounded-full text-small-dashboard font-semibold">
                                    Most Popular
                                </span>
                            </div>
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">Pro</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] font-tabular">R79</span>
                                <span className="text-body-dashboard text-gray-200">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Up to 20 trading bots
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Advanced analytics
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Priority support
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Custom strategies
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-gradient-to-r from-[#2F6BFF] to-[#2F6BFF] hover:from-[#2F6BFF] hover:to-[#FFA62B] text-white px-6 py-3 rounded-xl text-body-dashboard font-semibold transition-all duration-300 shadow-lg shadow-[#2F6BFF]/30"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="p-8 rounded-2xl border border-[#2F6BFF]/20 bg-[#16124A] hover:border-[#2F6BFF] transition-all duration-300">
                            <h3 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2">Enterprise</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Custom</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Unlimited trading bots
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Enterprise analytics
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    24/7 dedicated support
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Custom development
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-[#0B0633] hover:bg-[#2F6BFF]/10 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-gray-100 px-6 py-3 rounded-xl text-body-dashboard font-semibold transition-all duration-300"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-white/30 rounded-full"></div>
                </div>

                <div className="relative max-w-4xl mx-auto text-center z-10">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                        Ready to start trading?
                    </h2>
                    <p className="text-lg md:text-2xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                        Join <span className="font-bold text-white">thousands of traders</span> already using LemoTick to
                        <span className="font-bold text-white"> maximize their profits</span> and
                        <span className="font-bold text-white"> minimize risks</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="inline-block bg-white hover:bg-gray-100 text-[#2F6BFF] px-8 py-3 rounded-xl text-card-title font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Start Your Free Trial
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-block bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2F6BFF] px-8 py-3 rounded-xl text-card-title font-bold transition-all duration-300 transform hover:scale-105"
                        >
                            View Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0B0633] border-t border-[#2F6BFF]/20 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>

                            <p className="text-body-dashboard text-gray-200">
                                The modern trading platform for smart traders.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)] mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">Features</a></li>
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)] mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">About</a></li>
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">Blog</a></li>
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)] mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">Privacy</a></li>
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">Terms</a></li>
                                <li><a href="#" className="text-body-dashboard text-gray-200 hover:text-[#2F6BFF] transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-[#2F6BFF]/20 text-center text-body-dashboard text-gray-200">
                        <p>&copy; 2024 LemoTick. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
