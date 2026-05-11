import { PageHeader } from '@/components/ui/PageHeader';
import {
    ContentWrapper,
    PageCard,
    PageContainer,
    PageGrid,
    PageSection,
    Stack,
    StatsCard
} from '@/components/ui/PageLayoutEnhanced';
import { Award, BarChart3, Globe, Settings, Shield, Smartphone, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function Landing() {
    return (
        <PageContainer noPadding>
            {/* Hero Section */}
            <PageSection spacing="normal">
                <PageHeader variant="hero" title="LEMOTICK FIXES IT">
                    <Stack spacing="lg">
                        <div className="inline-block">
                            <span className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full text-body-dashboard text-red-400 font-semibold backdrop-blur-sm">
                                ⚠️ Most Prop Firms Profit When Traders Fail
                            </span>
                        </div>

                        <span className="block text-gray-400 text-2xl md:text-3xl">
                            Prop Trading is Broken.
                        </span>

                        <div className="inline-block">
                            <span className="px-4 py-2 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-body-dashboard text-[#2F6BFF] font-semibold backdrop-blur-sm">
                                🎯 Putting Traders First
                            </span>
                        </div>

                        <ContentWrapper maxWidth="normal" align="center">
                            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                                <span className="text-[#2F6BFF] font-semibold">Transparent rules</span>,
                                <span className="text-[#FFA62B] font-semibold"> 80/20 profit splits</span>, and
                                <span className="text-[#2F6BFF] font-semibold"> real scaling</span> up to R2.5 million.
                                No hidden fees. No phase two delays.
                            </p>
                        </ContentWrapper>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-[#2F6BFF] to-[#2F6BFF] hover:from-[#2F6BFF] hover:to-[#FFA62B] text-white px-8 py-3 rounded-xl text-card-title font-semibold shadow-lg shadow-[#2F6BFF]/30 hover:shadow-[#2F6BFF]/50 transition-all duration-300 transform hover:scale-105"
                            >
                                Start Your Evaluation
                            </Link>
                            <Link
                                to="/how-it-works"
                                className="bg-[#16124A] hover:bg-[#2F6BFF]/10 text-gray-100 px-8 py-3 rounded-xl text-card-title font-semibold border border-[#2F6BFF]/30 hover:border-[#2F6BFF] shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                How It Works
                            </Link>
                        </div>
                    </Stack>
                </PageHeader>
            </PageSection>

            {/* Features Section */}
            <PageSection spacing="normal" background="subtle">
                <ContentWrapper maxWidth="normal" align="center">
                    <Stack spacing="md" className="mb-12">
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-small-dashboard text-[#2F6BFF] font-semibold">
                            Features
                        </span>
                        <h2 className="text-3xl md:text-4xl text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] font-normal uppercase">
                            EVERYTHING YOU NEED TO SUCCEED
                        </h2>
                        <p className="text-card-title text-gray-200">
                            Powerful features designed to help you trade smarter and grow your portfolio faster
                        </p>
                    </Stack>
                </ContentWrapper>

                <PageGrid cols={3} gap="lg">
                    <PageCard padding="lg">
                        <Stack spacing="md">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-[#2F6BFF]" />
                            </div>
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold">
                                Real-time Analytics
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Track your metrics in real-time with beautiful, interactive charts and graphs.
                            </p>
                        </Stack>
                    </PageCard>

                    <PageCard padding="lg">
                        <Stack spacing="md">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#2F6BFF]" />
                            </div>
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold">
                                Automated Trading
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Set up trading bots with custom strategies and let them work for you 24/7.
                            </p>
                        </Stack>
                    </PageCard>

                    <PageCard padding="lg">
                        <Stack spacing="md">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-[#2F6BFF]" />
                            </div>
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold">
                                Secure & Reliable
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Enterprise-grade security with 99.9% uptime guarantee and data encryption.
                            </p>
                        </Stack>
                    </PageCard>

                    <PageCard padding="lg">
                        <Stack spacing="md">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center">
                                <Settings className="w-6 h-6 text-[#2F6BFF]" />
                            </div>
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold">
                                Advanced Indicators
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Access 20+ technical indicators and drawing tools for comprehensive analysis.
                            </p>
                        </Stack>
                    </PageCard>

                    <PageCard padding="lg">
                        <Stack spacing="md">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-[#2F6BFF]" />
                            </div>
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold">
                                Lightning Fast
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Optimized performance ensures your trades execute instantly, every time.
                            </p>
                        </Stack>
                    </PageCard>

                    <PageCard padding="lg">
                        <Stack spacing="md">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-[#2F6BFF]" />
                            </div>
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold">
                                Mobile Ready
                            </h3>
                            <p className="text-body-dashboard text-gray-200">
                                Trade anywhere with our fully responsive mobile design and native apps.
                            </p>
                        </Stack>
                    </PageCard>
                </PageGrid>
            </PageSection>

            {/* Stats Section */}
            <PageSection spacing="normal" background="gradient" fullWidth>
                <PageGrid cols={4} gap="lg">
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
            <PageSection spacing="normal">
                <ContentWrapper maxWidth="normal" align="center">
                    <Stack spacing="md" className="mb-12">
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-small-dashboard text-[#2F6BFF] font-semibold">
                            Simple Process
                        </span>
                        <h2 className="text-3xl md:text-4xl font-normal text-white uppercase">
                            YOUR PATH TO EARNING REAL REWARDS
                        </h2>
                        <p className="text-card-title text-gray-200">
                            Three simple steps from evaluation to weekly payouts
                        </p>
                    </Stack>
                </ContentWrapper>

                <PageGrid cols={3} gap="lg">
                    <PageCard padding="lg" variant="bordered" className="relative">
                        <div className="absolute -top-4 left-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                1
                            </div>
                        </div>
                        <Stack spacing="md" className="mt-6">
                            <h3 className="text-xl md:text-2xl font-semibold text-white">Start Your Evaluation</h3>
                            <p className="text-gray-300">
                                Choose your account size and begin trading. Hit the 10% profit target while staying within risk parameters.
                            </p>
                            <div className="flex items-center text-[#2F6BFF] text-sm font-semibold">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                One-step evaluation
                            </div>
                        </Stack>
                    </PageCard>

                    <PageCard padding="lg" variant="bordered" className="relative">
                        <div className="absolute -top-4 left-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                2
                            </div>
                        </div>
                        <Stack spacing="md" className="mt-6">
                            <h3 className="text-xl md:text-2xl font-semibold text-white">Get Funded Immediately</h3>
                            <p className="text-gray-300">
                                Pass the evaluation and start trading on a funded account. No phase two, no delays. Begin earning right away.
                            </p>
                            <div className="flex items-center text-[#FFA62B] text-sm font-semibold">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                80/20 profit split
                            </div>
                        </Stack>
                    </PageCard>

                    <PageCard padding="lg" variant="bordered" className="relative">
                        <div className="absolute -top-4 left-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFA62B] to-[#FF8C00] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                3
                            </div>
                        </div>
                        <Stack spacing="md" className="mt-6">
                            <h3 className="text-xl md:text-2xl font-semibold text-white">Earn Weekly Payouts</h3>
                            <p className="text-gray-300">
                                Trade for 7 days and receive bi-weekly payouts. Scale your account up to R2.5 million with consistent performance.
                            </p>
                            <div className="flex items-center text-green-400 text-sm font-semibold">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Bi-weekly payouts
                            </div>
                        </Stack>
                    </PageCard>
                </PageGrid>

                <div className="text-center mt-12">
                    <Link
                        to="/how-it-works"
                        className="inline-flex items-center text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors"
                    >
                        Learn more about our process
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </PageSection>

            {/* CTA Section */}
            <PageSection spacing="normal" fullWidth>
                <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full"></div>
                        <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white/30 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-white/30 rounded-full"></div>
                    </div>

                    <ContentWrapper maxWidth="normal" align="center" className="relative z-10">
                        <Stack spacing="lg">
                            <h2 className="text-3xl md:text-5xl font-normal text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] uppercase">
                                READY TO START TRADING?
                            </h2>
                            <p className="text-lg md:text-2xl text-white/95 leading-relaxed font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
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
                        </Stack>
                    </ContentWrapper>
                </div>
            </PageSection>
        </PageContainer>
    );
}

export default Landing;
