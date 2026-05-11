// Modern Public Page Header Component
// Stylish, professional header for public pages with animated elements

import { ReactNode } from 'react';

interface PublicPageHeaderProps {
    // Page identifier
    page: 'landing' | 'how-it-works' | 'pricing' | 'about' | 'markets' | 'partners' | 'rules' | 'faq';

    // Optional custom content
    children?: ReactNode;
}

const pageConfig = {
    'landing': {
        badge: '🚀 South Africa\'s Most Transparent Prop Firm',
        title: 'GET FUNDED. KEEP 80%. SCALE TO R2.5M.',
        subtitle: 'One-step evaluation • No hidden rules • Bi-weekly payouts',
        gradient: 'from-[#2F6BFF] via-[#5B8FFF] to-[#FFA62B]',
    },
    'how-it-works': {
        badge: '📚 Simple Process',
        title: 'HOW LEMOTICK WORKS',
        subtitle: 'Learn how to get funded, earn profits, and scale your account',
        gradient: 'from-[#2F6BFF] to-[#3B82F6]',
    },
    'pricing': {
        badge: '💰 Transparent Pricing',
        title: 'CHOOSE YOUR EVALUATION',
        subtitle: 'One-time fee • One-step evaluation • Start your funded trading journey',
        gradient: 'from-[#2F6BFF] to-[#FFA62B]',
    },
    'about': {
        badge: '🏆 Our Story',
        title: 'RESTORING TRUST IN PROP TRADING',
        subtitle: 'Built by traders, for traders • Transparent • Verifiable • Fair',
        gradient: 'from-[#2F6BFF] via-[#8B5CF6] to-[#FFA62B]',
    },
    'markets': {
        badge: '🌍 Global Markets',
        title: 'TRADE ACROSS ALL MARKETS',
        subtitle: 'Forex • Crypto • Indices • Commodities • 200+ instruments',
        gradient: 'from-[#2F6BFF] to-[#10B981]',
    },
    'partners': {
        badge: '🤝 Partnership Program',
        title: 'PARTNER WITH LEMOTICK',
        subtitle: 'Earn up to 30% lifetime commission • Generous rewards • Full support',
        gradient: 'from-[#FFA62B] to-[#FF6B6B]',
    },
    'rules': {
        badge: '📋 Documentation',
        title: 'RULES & GUIDELINES',
        subtitle: 'Complete guide to evaluation rules, trading conditions, and payouts',
        gradient: 'from-[#2F6BFF] to-[#8B5CF6]',
    },
    'faq': {
        badge: '❓ Help Center',
        title: 'FREQUENTLY ASKED QUESTIONS',
        subtitle: 'Everything you need to know before starting your evaluation',
        gradient: 'from-[#2F6BFF] to-[#3B82F6]',
    },
};

export function PublicPageHeader({ page, children }: PublicPageHeaderProps) {
    const config = pageConfig[page];

    return (
        <div className="relative mb-12 md:mb-16">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#2F6BFF]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-10 right-1/4 w-48 h-48 bg-[#FFA62B]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative text-center">
                {/* Badge */}
                <div className="inline-block mb-4 animate-fade-in">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/40 rounded-full text-sm text-white font-bold backdrop-blur-md shadow-[0_0_20px_rgba(47,107,255,0.3)]">
                        {config.badge}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight animate-slide-up">
                    <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(47,107,255,0.5)]`}>
                        {config.title}
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg md:text-xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {config.subtitle}
                </p>

                {/* Decorative Line */}
                <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#2F6BFF]/50"></div>
                    <div className="w-2 h-2 rounded-full bg-[#2F6BFF] shadow-[0_0_10px_rgba(47,107,255,0.8)]"></div>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#2F6BFF]/50"></div>
                </div>

                {/* Additional Content */}
                {children && (
                    <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        {children}
                    </div>
                )}
            </div>

            {/* Bottom Glow Effect */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#2F6BFF]/50 to-transparent"></div>
        </div>
    );
}

// Compact variant for pages that need less space
export function PublicPageHeaderCompact({ page }: { page: PublicPageHeaderProps['page'] }) {
    const config = pageConfig[page];

    return (
        <div className="relative mb-8 md:mb-10">
            {/* Content */}
            <div className="relative text-center">
                {/* Badge */}
                <div className="inline-block mb-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/40 rounded-full text-xs text-white font-bold backdrop-blur-md">
                        {config.badge}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
                    <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                        {config.title}
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
                    {config.subtitle}
                </p>
            </div>
        </div>
    );
}
