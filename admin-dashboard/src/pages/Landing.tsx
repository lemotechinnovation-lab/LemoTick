import { PageHeader } from '@/components/ui/PageHeader';
import {
    ContentWrapper,
    PageGrid,
    PageSection,
    Stack,
    StatsCard
} from '@/components/ui/PageLayoutEnhanced';
import { Award, BarChart3, Globe, Settings, Shield, Smartphone, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div className="min-h-screen bg-[#B1B1C1] relative overflow-x-hidden">
            {/* Animated Background Effects - Matching Enhanced Pages */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-blue/40 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-accent-orange/40 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/30 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
                <PageSection spacing="normal" background="transparent">
                    <PageHeader variant="hero" title="">
                        <Stack spacing="lg">
                            {/* Problem Statement Badge */}
                            <div className="flex justify-center animate-pulse">
                                <span className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/40 rounded-full text-sm text-red-400 font-bold backdrop-blur-sm shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center max-w-full">
                                    ⚠️ Most Prop Firms Profit When You Fail
                                </span>
                            </div>

                            {/* Main Headline */}
                            <div className="space-y-2 sm:space-y-4">
                                <h1 className="hero-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight break-words">
                                    GET FUNDED.
                                    <br />
                                    <span className="!text-[#3474f9]">
                                        KEEP 80%.
                                    </span>
                                    <br />
                                    SCALE TO R2.5M.
                                </h1>
                            </div>

                            {/* Solution Badge */}
                            <div className="flex justify-center">
                                <span className="px-4 py-2 bg-gradient-to-r from-brand-blue/30 to-accent-orange/30 border-2 border-brand-blue/50 rounded-full text-sm sm:text-base text-white font-bold backdrop-blur-sm shadow-[0_0_30px_rgba(47,107,255,0.3)] text-center max-w-full">
                                    ✨ South Africa's Most Transparent Prop Firm
                                </span>
                            </div>

                            {/* Value Proposition */}
                            <ContentWrapper maxWidth="normal" align="center">
                                <p className="text-base sm:text-xl md:text-2xl text-gray-100 leading-relaxed font-semibold">
                                    <span className="text-white">One-step evaluation.</span>{' '}
                                    <span className="text-brand-blue">No hidden rules.</span>{' '}
                                    <span className="text-white">Bi-weekly payouts.</span>
                                </p>
                                <p className="text-sm sm:text-lg md:text-xl text-white leading-relaxed font-medium mt-4">
                                    Pass our 10% profit target challenge and start trading with{' '}
                                    <span className="text-accent-orange font-bold">real capital</span>.{' '}
                                    Keep <span className="text-brand-blue font-bold">80% of every rand</span> you earn.{' '}
                                    No phase two. No delays. No excuses.
                                </p>
                            </ContentWrapper>

                            {/* Social Proof */}
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-accent-orange border-2 border-dark"></div>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-orange to-[#FF6B6B] border-2 border-dark"></div>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-[#8B5CF6] border-2 border-dark"></div>
                                    </div>
                                    <span className="text-white font-semibold">10,000+ Active Traders</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="text-white font-semibold">4.8/5 Rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">💰</span>
                                    <span className="text-white font-semibold">R2.5B+ Traded</span>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                                <Link
                                    to="/register"
                                    className="group relative bg-gradient-to-r from-brand-blue to-blue-500 hover:from-blue-500 hover:to-[brand-blue] text-white px-10 py-5 rounded-xl text-lg md:text-xl font-black shadow-[0_0_40px_rgba(47,107,255,0.4)] hover:shadow-[0_0_60px_rgba(47,107,255,0.6)] transition-all duration-300 transform hover:scale-105"
                                >
                                    <span className="relative z-10">Start Your Evaluation Now</span>
                                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                                <Link
                                    to="/how-it-works"
                                    className="glass-card-elevated hover:bg-card/60 backdrop-blur-sm border-2 border-brand-blue/40 hover:border-brand-blue text-white px-10 py-5 rounded-xl text-lg md:text-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    See How It Works →
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
                                <div className="flex items-center gap-2 text-gray-200">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    <span className="text-sm font-medium">Bank-Level Security</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-200">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <span className="text-sm font-medium">Instant Activation</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-200">
                                    <Award className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm font-medium">99.9% Uptime</span>
                                </div>
                            </div>
                        </Stack>
                    </PageHeader>
                </PageSection>

                {/* Features Section */}
                <PageSection spacing="normal" background="transparent">
                    <ContentWrapper maxWidth="normal" align="center">
                        <Stack spacing="sm" className="mb-8">
                            <span className="inline-block px-4 py-2 bg-gradient-to-r from-brand-blue/20 to-accent-orange/20 border border-brand-blue/30 rounded-full text-xs text-brand-blue font-bold">
                                🚀 POWERFUL FEATURES
                            </span>
                            <h2 className="text-lg md:text-xl text-white font-bold tracking-tight">
                                TRADE LIKE A PRO
                            </h2>
                            <p className="text-sm text-gray-200 font-medium leading-relaxed max-w-3xl mx-auto">
                                Everything you need to succeed in one powerful platform
                            </p>
                        </Stack>
                    </ContentWrapper>

                    <PageGrid cols={3} gap="sm">
                        <div className="glass-card-elevated p-5 smooth-hover rounded-2xl backdrop-blur-md border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.12)] hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] hover:border-brand-blue/40 transition-all duration-300">
                            <Stack spacing="sm">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-brand-blue" />
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    Real-Time Analytics
                                </h3>
                                <p className="text-white leading-relaxed font-medium text-xs">
                                    Track every trade with <span className="text-white font-bold">institutional-grade analytics</span>. Beautiful charts, live P&L, and performance insights at your fingertips.
                                </p>
                            </Stack>
                        </div>

                        <div className="glass-card-elevated p-5 smooth-hover rounded-2xl backdrop-blur-md border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.12)] hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] hover:border-brand-blue/40 transition-all duration-300">
                            <Stack spacing="sm">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-brand-blue" />
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    Automated Trading
                                </h3>
                                <p className="text-white leading-relaxed font-medium text-xs">
                                    Deploy your <span className="text-white font-bold">custom trading bots</span> and EAs. Let algorithms work 24/7 while you sleep.
                                </p>
                            </Stack>
                        </div>

                        <div className="glass-card-elevated p-5 smooth-hover rounded-2xl backdrop-blur-md border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.12)] hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] hover:border-brand-blue/40 transition-all duration-300">
                            <Stack spacing="sm">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-brand-blue" />
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    Bank-Level Security
                                </h3>
                                <p className="text-white leading-relaxed font-medium text-xs">
                                    Your data is protected with <span className="text-white font-bold">military-grade encryption</span>. 99.9% uptime guaranteed.
                                </p>
                            </Stack>
                        </div>

                        <div className="glass-card-elevated p-5 smooth-hover rounded-2xl backdrop-blur-md border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.12)] hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] hover:border-brand-blue/40 transition-all duration-300">
                            <Stack spacing="sm">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-xl flex items-center justify-center">
                                    <Settings className="w-6 h-6 text-brand-blue" />
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    Advanced Tools
                                </h3>
                                <p className="text-white leading-relaxed font-medium text-xs">
                                    Access <span className="text-white font-bold">20+ technical indicators</span>, drawing tools, and professional charting for deep market analysis.
                                </p>
                            </Stack>
                        </div>

                        <div className="glass-card-elevated p-5 smooth-hover rounded-2xl backdrop-blur-md border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.12)] hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] hover:border-brand-blue/40 transition-all duration-300">
                            <Stack spacing="sm">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-brand-blue" />
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    Lightning Execution
                                </h3>
                                <p className="text-white leading-relaxed font-medium text-xs">
                                    <span className="text-white font-bold">Sub-10ms execution</span> speed. Your orders hit the market instantly, every single time.
                                </p>
                            </Stack>
                        </div>

                        <div className="glass-card-elevated p-5 smooth-hover rounded-2xl backdrop-blur-md border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.12)] hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] hover:border-brand-blue/40 transition-all duration-300">
                            <Stack spacing="sm">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-xl flex items-center justify-center">
                                    <Smartphone className="w-6 h-6 text-brand-blue" />
                                </div>
                                <h3 className="text-sm font-bold text-white">
                                    Trade Anywhere
                                </h3>
                                <p className="text-white leading-relaxed font-medium text-xs">
                                    <span className="text-white font-bold">Fully responsive</span> on desktop, tablet, and mobile. Trade from anywhere in the world.
                                </p>
                            </Stack>
                        </div>
                    </PageGrid>
                </PageSection>

                {/* Stats Section */}
                <PageSection spacing="normal" background="transparent" fullWidth>
                    <PageGrid cols={4} gap="sm">
                        <StatsCard
                            icon={<Users className="w-6 h-6" />}
                            value="10K+"
                            label="Active Traders"
                        />
                        <StatsCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            value="R2.5B+"
                            label="Trading Volume"
                        />
                        <StatsCard
                            icon={<Globe className="w-6 h-6" />}
                            value="150+"
                            label="Countries"
                        />
                        <StatsCard
                            icon={<Award className="w-6 h-6" />}
                            value="99.9%"
                            label="Uptime"
                        />
                    </PageGrid>
                </PageSection>

                {/* 3-Step Process Section */}
                <PageSection spacing="normal" background="transparent">
                    <ContentWrapper maxWidth="normal" align="center">
                        <Stack spacing="sm" className="mb-8">
                            <span className="inline-block px-4 py-2 bg-gradient-to-r from-brand-blue/20 to-accent-orange/20 border border-brand-blue/30 rounded-full text-xs text-brand-blue font-bold">
                                💎 SIMPLE PROCESS
                            </span>
                            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                                FROM ZERO TO FUNDED IN 3 STEPS
                            </h2>
                            <p className="text-sm text-gray-200 font-medium leading-relaxed">
                                Start earning real money in as little as 24 hours
                            </p>
                        </Stack>
                    </ContentWrapper>

                    <PageGrid cols={3} gap="sm">
                        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-md border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.12)] hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] hover:border-brand-blue/40 transition-all duration-300">
                            <div className="absolute -top-4 left-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-[#3B82F6] flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(47,107,255,0.4)]">
                                    1
                                </div>
                            </div>
                            <Stack spacing="sm" className="mt-4">
                                <h3 className="text-base font-bold text-white">Pass The Challenge</h3>
                                <p className="text-gray-200 leading-relaxed font-medium text-xs">
                                    Hit <span className="text-brand-blue font-bold">10% profit</span> while staying within <span className="text-accent-orange font-bold">5% drawdown</span>. No time limit. No minimum days.
                                </p>
                                <div className="flex items-center gap-2 px-3 py-2 bg-brand-blue/10 rounded-lg border border-brand-blue/30">
                                    <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="text-brand-blue font-bold text-xs">One-step evaluation only</span>
                                </div>
                            </Stack>
                        </div>

                        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-md border border-accent-orange/20 shadow-[0_0_20px_rgba(255,166,43,0.12)] hover:shadow-[0_0_20px_rgba(255,166,43,0.2)] hover:border-accent-orange/30 transition-all duration-300">
                            <div className="absolute -top-4 left-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-accent-orange flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(255,166,43,0.4)]">
                                    2
                                </div>
                            </div>
                            <Stack spacing="sm" className="mt-4">
                                <h3 className="text-base font-bold text-white">Get Funded Instantly</h3>
                                <p className="text-gray-200 leading-relaxed font-medium text-xs">
                                    Pass and your <span className="text-accent-orange font-bold">funded account activates immediately</span>. No phase two. No waiting. Start trading real capital today.
                                </p>
                                <div className="flex items-center gap-2 px-3 py-2 bg-accent-orange/10 rounded-lg border border-accent-orange/30">
                                    <svg className="w-4 h-4 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-accent-orange font-bold text-xs">Keep 80% of all profits</span>
                                </div>
                            </Stack>
                        </div>

                        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-md border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.12)] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:border-green-500/30 transition-all duration-300">
                            <div className="absolute -top-4 left-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange to-[#FF8C00] flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(255,140,0,0.4)]">
                                    3
                                </div>
                            </div>
                            <Stack spacing="sm" className="mt-4">
                                <h3 className="text-base font-bold text-white">Scale & Earn</h3>
                                <p className="text-gray-200 leading-relaxed font-medium text-xs">
                                    Receive <span className="text-green-400 font-bold">bi-weekly payouts</span> directly to your bank. Scale up to <span className="text-green-400 font-bold">R2.5 million</span> with consistent performance.
                                </p>
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/30">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-green-400 font-bold text-xs">Unlimited earning potential</span>
                                </div>
                            </Stack>
                        </div>
                    </PageGrid>

                    <div className="text-center mt-8">
                        <Link
                            to="/how-it-works"
                            className="inline-flex items-center text-sm text-brand-blue hover:text-accent-orange font-bold transition-colors group"
                        >
                            See the complete process
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </PageSection>

                {/* CTA Section */}
                <PageSection spacing="normal" fullWidth>
                    <div className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-blue/20 via-[#16124A]/40 to-accent-orange/20 overflow-hidden border-y border-brand-blue/20">
                        {/* Animated Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-20">
                            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/40 rounded-full animate-pulse"></div>
                            <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute top-1/4 right-1/4 w-36 h-36 border-2 border-white/40 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        </div>

                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>

                        <ContentWrapper maxWidth="normal" align="center" className="relative z-10">
                            <Stack spacing="lg">
                                {/* Urgency Badge */}
                                <div className="inline-block animate-bounce">
                                    <span className="px-6 py-3 bg-white/20 backdrop-blur-md border-2 border-white/50 rounded-full text-base text-white font-black shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                        ⚡ LIMITED TIME: First 100 Traders Get 50% Off
                                    </span>
                                </div>

                                {/* Main Headline */}
                                <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)] tracking-tight leading-tight break-words">
                                    DON'T TRADE WITH
                                    <br />
                                    <span className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl">
                                        YOUR OWN MONEY
                                    </span>
                                </h2>

                                {/* Subheadline */}
                                <p className="text-xl md:text-3xl text-white font-bold leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.3)] max-w-4xl mx-auto">
                                    Trade with <span className="text-yellow-300">OUR capital</span>. Keep <span className="text-yellow-300">80% of profits</span>. Zero risk to your wallet.
                                </p>

                                {/* Social Proof Stats */}
                                <div className="flex flex-wrap items-center justify-center gap-8 py-6">
                                    <div className="text-center">
                                        <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">10,000+</div>
                                        <div className="text-sm md:text-base text-white/90 font-semibold mt-1">Funded Traders</div>
                                    </div>
                                    <div className="hidden sm:block w-px h-16 bg-white/30"></div>
                                    <div className="text-center">
                                        <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">R2.5B+</div>
                                        <div className="text-sm md:text-base text-white/90 font-semibold mt-1">Paid Out</div>
                                    </div>
                                    <div className="hidden sm:block w-px h-16 bg-white/30"></div>
                                    <div className="text-center">
                                        <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">24hrs</div>
                                        <div className="text-sm md:text-base text-white/90 font-semibold mt-1">To Get Funded</div>
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
                                    <Link
                                        to="/register"
                                        className="group relative bg-white hover:bg-gray-50 text-brand-blue px-12 py-6 rounded-2xl text-xl md:text-2xl font-black shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:shadow-[0_0_60px_rgba(255,255,255,0.7)] transition-all duration-300 transform hover:scale-110 overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            🚀 GET FUNDED NOW
                                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-white opacity-0 group-hover:opacity-30 transition-opacity"></div>
                                    </Link>
                                    <Link
                                        to="/how-it-works"
                                        className="bg-white/10 hover:bg-white/25 backdrop-blur-md border-3 border-white/60 hover:border-white text-white px-10 py-6 rounded-2xl text-lg md:text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Learn More →
                                    </Link>
                                </div>

                                {/* Trust Indicators */}
                                <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-semibold">No Credit Card Required</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-semibold">Cancel Anytime</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-semibold">Instant Account Setup</span>
                                    </div>
                                </div>

                                {/* Countdown Timer Effect (Static for now) */}
                                <div className="inline-block mt-4">
                                    <div className="px-6 py-3 bg-black/30 backdrop-blur-md rounded-xl border border-white/30">
                                        <p className="text-white/80 text-sm font-semibold mb-2">⏰ Offer expires in:</p>
                                        <div className="flex gap-4 justify-center">
                                            <div className="text-center">
                                                <div className="text-2xl md:text-3xl font-black text-white">23</div>
                                                <div className="text-xs text-white/70 font-medium">HOURS</div>
                                            </div>
                                            <div className="text-2xl md:text-3xl font-black text-white">:</div>
                                            <div className="text-center">
                                                <div className="text-2xl md:text-3xl font-black text-white">59</div>
                                                <div className="text-xs text-white/70 font-medium">MINS</div>
                                            </div>
                                            <div className="text-2xl md:text-3xl font-black text-white">:</div>
                                            <div className="text-center">
                                                <div className="text-2xl md:text-3xl font-black text-white">47</div>
                                                <div className="text-xs text-white/70 font-medium">SECS</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Stack>
                        </ContentWrapper>
                    </div>
                </PageSection>
            </div>
        </div>
    );
}

export default Landing;






