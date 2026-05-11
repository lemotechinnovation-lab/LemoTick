import { PageHeader } from '@/components/ui/PageHeader';
import { HeroPageContainer, PageCard, PageContainer, PageGrid, PageSection } from '@/components/ui/PageLayout';
import { Link } from 'react-router-dom';

function Landing() {
    return (
        <PageContainer>
            {/* Hero Section */}
            <PageHeader variant="hero" title="LEMOTICK FIXES IT">
                <div className="inline-block mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full text-body-dashboard text-red-400 font-semibold backdrop-blur-sm">
                        ⚠️ Most Prop Firms Profit When Traders Fail
                    </span>
                </div>
                <div className="mb-4">
                    <span className="block text-gray-400 text-2xl md:text-3xl mb-2">Prop Trading is Broken.</span>
                </div>
                <div className="inline-block mb-6">
                    <span className="px-4 py-2 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-body-dashboard text-[#2F6BFF] font-semibold backdrop-blur-sm">
                        🎯 Putting Traders First
                    </span>
                </div>
                <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
                    <span className="text-[#2F6BFF] font-semibold">Transparent rules</span>,
                    <span className="text-[#FFA62B] font-semibold"> 80/20 profit splits</span>, and
                    <span className="text-[#2F6BFF] font-semibold"> real scaling</span> up to R2.5 million.
                    No hidden fees. No phase two delays.
                </p>
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
            </PageHeader>

            {/* Features Section */}
            <PageSection className="bg-[#16124A]/30">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-small-dashboard text-[#2F6BFF] font-semibold mb-4">
                        Features
                    </span>
                    <h2 className="text-3xl md:text-4xl text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-4 font-normal uppercase">
                        EVERYTHING YOU NEED TO SUCCEED
                    </h2>
                    <p className="text-card-title text-gray-200 max-w-2xl mx-auto">
                        Powerful features designed to help you trade smarter and grow your portfolio faster
                    </p>
                </div>

                <PageGrid cols={3} gap="lg">
                    {/* Feature 1 */}
                    <PageCard>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">
                            Real-time Analytics
                        </h3>
                        <p className="text-body-dashboard text-gray-200">
                            Track your metrics in real-time with beautiful, interactive charts and graphs.
                        </p>
                    </PageCard>

                    {/* Feature 2 */}
                    <PageCard>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">
                            Automated Trading
                        </h3>
                        <p className="text-body-dashboard text-gray-200">
                            Set up trading bots with custom strategies and let them work for you 24/7.
                        </p>
                    </PageCard>

                    {/* Feature 3 */}
                    <PageCard>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">
                            Secure & Reliable
                        </h3>
                        <p className="text-body-dashboard text-gray-200">
                            Enterprise-grade security with 99.9% uptime guarantee and data encryption.
                        </p>
                    </PageCard>

                    {/* Feature 4 */}
                    <PageCard>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">
                            Advanced Indicators
                        </h3>
                        <p className="text-body-dashboard text-gray-200">
                            Access 20+ technical indicators and drawing tools for comprehensive analysis.
                        </p>
                    </PageCard>

                    {/* Feature 5 */}
                    <PageCard>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">
                            Lightning Fast
                        </h3>
                        <p className="text-body-dashboard text-gray-200">
                            Optimized performance ensures your trades execute instantly, every time.
                        </p>
                    </PageCard>

                    {/* Feature 6 */}
                    <PageCard>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">
                            Mobile Ready
                        </h3>
                        <p className="text-body-dashboard text-gray-200">
                            Trade anywhere with our fully responsive mobile design and native apps.
                        </p>
                    </PageCard>
                </PageGrid>
            </PageSection>

            {/* Stats Section */}
            <PageSection className="bg-gradient-to-r from-[#2F6BFF]/10 to-[#FFA62B]/10 border-y border-[#2F6BFF]/20">
                <PageGrid cols={4} gap="lg">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-2 font-tabular">10K+</div>
                        <div className="text-body-dashboard text-gray-200">Active Traders</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-2 font-tabular">R2.5B+</div>
                        <div className="text-body-dashboard text-gray-200">Trading Volume</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-2 font-tabular">150+</div>
                        <div className="text-body-dashboard text-gray-200">Countries</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-2 font-tabular">99.9%</div>
                        <div className="text-body-dashboard text-gray-200">Uptime</div>
                    </div>
                </PageGrid>
            </PageSection>

            {/* 3-Step Process Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0633]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-small-dashboard text-[#2F6BFF] font-semibold mb-4">
                            Simple Process
                        </span>
                        <h2 className="text-3xl md:text-4xl font-normal text-white mb-4 uppercase">
                            YOUR PATH TO EARNING REAL REWARDS
                        </h2>
                        <p className="text-card-title text-gray-200 max-w-2xl mx-auto">
                            Three simple steps from evaluation to weekly payouts
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300">
                            <div className="absolute -top-4 left-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    1
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">Start Your Evaluation</h3>
                                <p className="text-gray-300 mb-4">
                                    Choose your account size and begin trading. Hit the 10% profit target while staying within risk parameters.
                                </p>
                                <div className="flex items-center text-[#2F6BFF] text-sm font-semibold">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    One-step evaluation
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300">
                            <div className="absolute -top-4 left-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    2
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">Get Funded Immediately</h3>
                                <p className="text-gray-300 mb-4">
                                    Pass the evaluation and start trading on a funded account. No phase two, no delays. Begin earning right away.
                                </p>
                                <div className="flex items-center text-[#FFA62B] text-sm font-semibold">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    80/20 profit split
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative p-6 rounded-2xl bg-[#16124A] border border-[#2F6BFF]/20 hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300">
                            <div className="absolute -top-4 left-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFA62B] to-[#FF8C00] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    3
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">Earn Weekly Payouts</h3>
                                <p className="text-gray-300 mb-4">
                                    Trade for 7 days and receive bi-weekly payouts. Scale your account up to R2.5 million with consistent performance.
                                </p>
                                <div className="flex items-center text-green-400 text-sm font-semibold">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Bi-weekly payouts
                                </div>
                            </div>
                        </div>
                    </div>

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
                </div>
            </section>

            {/* Comparison Table Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0D0735] via-[#0B0633] to-[#16124A]/60">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-small-dashboard text-[#2F6BFF] font-semibold mb-4">
                            Why Choose Us
                        </span>
                        <h2 className="text-3xl md:text-4xl text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-4 font-normal uppercase">
                            HOW LEMOTICK COMPARES
                        </h2>
                        <p className="text-card-title text-gray-200 max-w-2xl mx-auto">
                            See why traders are switching to a platform that's built different
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-[#2F6BFF]/30">
                                    <th className="text-left p-4 text-gray-400 font-semibold">Feature</th>
                                    <th className="p-4 text-center">
                                        <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] rounded-lg">
                                            <span className="text-white font-bold">LemoTick</span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-center text-gray-400 font-semibold">Other Firms</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                <tr className="border-b border-[#2F6BFF]/10 hover:bg-[#16124A]/30">
                                    <td className="p-4">Challenge Structure</td>
                                    <td className="p-4 text-center text-[#2F6BFF] font-semibold">One-Step</td>
                                    <td className="p-4 text-center text-gray-500">Two-Step</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10 hover:bg-[#16124A]/30">
                                    <td className="p-4">Profit Target</td>
                                    <td className="p-4 text-center text-[#2F6BFF] font-semibold">10%</td>
                                    <td className="p-4 text-center text-gray-500">Ph.1: 10% / Ph.2: 5%</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10 hover:bg-[#16124A]/30">
                                    <td className="p-4">Max Drawdown</td>
                                    <td className="p-4 text-center text-[#2F6BFF] font-semibold">5% (8% scaled)</td>
                                    <td className="p-4 text-center text-gray-500">10% static, 5% daily</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10 hover:bg-[#16124A]/30">
                                    <td className="p-4">Profit Split</td>
                                    <td className="p-4 text-center">
                                        <span className="text-[#FFA62B] font-bold">80/20</span>
                                        <span className="text-xs text-gray-400 block">You keep 80%</span>
                                    </td>
                                    <td className="p-4 text-center text-gray-500">70/30 - 80/20</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10 hover:bg-[#16124A]/30">
                                    <td className="p-4">Account Scaling</td>
                                    <td className="p-4 text-center text-[#2F6BFF] font-semibold">Up to R2.5M</td>
                                    <td className="p-4 text-center text-gray-500">Up to R400k</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10 hover:bg-[#16124A]/30">
                                    <td className="p-4">Payout Frequency</td>
                                    <td className="p-4 text-center text-[#2F6BFF] font-semibold">Bi-weekly</td>
                                    <td className="p-4 text-center text-gray-500">Monthly</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10 hover:bg-[#16124A]/30">
                                    <td className="p-4">News Trading</td>
                                    <td className="p-4 text-center">
                                        <svg className="w-6 h-6 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </td>
                                    <td className="p-4 text-center">
                                        <svg className="w-6 h-6 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </td>
                                </tr>
                                <tr className="hover:bg-[#16124A]/30">
                                    <td className="p-4">Weekend Trading</td>
                                    <td className="p-4 text-center">
                                        <svg className="w-6 h-6 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </td>
                                    <td className="p-4 text-center text-gray-500 text-sm">Position Holding Only</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/register"
                            className="inline-block bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Start Your Evaluation Today
                        </Link>
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
                        <h2 className="text-3xl md:text-4xl text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-4 font-normal uppercase">
                            TRUSTED BY TRADERS WORLDWIDE
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
                        <h2 className="text-3xl md:text-4xl text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-4 font-normal uppercase">
                            SIMPLE, TRANSPARENT PRICING
                        </h2>
                        <p className="text-card-title text-gray-200 max-w-2xl mx-auto">
                            Choose your evaluation tier and start your journey to becoming a funded trader
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Starter Plan */}
                        <div className="p-8 rounded-2xl border border-[#2F6BFF]/20 bg-[#16124A] hover:border-[#2F6BFF] transition-all duration-300">
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">Starter</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] font-tabular">R1,500</span>
                                <span className="text-body-dashboard text-gray-200"> One-Time</span>
                            </div>
                            <div className="mb-6">
                                <div className="text-lg font-semibold text-[#2F6BFF] mb-1">R10,000 Account</div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    10% Profit Target
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    5% Max Drawdown
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Unlimited Trading Period
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Scale Up to R100k
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-[#0B0633] hover:bg-[#2F6BFF]/10 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-gray-100 px-6 py-3 rounded-xl text-body-dashboard font-semibold transition-all duration-300"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Tier II Plan - Most Popular */}
                        <div className="p-8 rounded-2xl border-2 border-[#2F6BFF] bg-[#16124A] relative shadow-lg shadow-[#2F6BFF]/20">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-4 py-1 rounded-full text-small-dashboard font-semibold">
                                    Most Popular
                                </span>
                            </div>
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">Tier II</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] font-tabular">R4,500</span>
                                <span className="text-body-dashboard text-gray-200"> One-Time</span>
                            </div>
                            <div className="mb-6">
                                <div className="text-lg font-semibold text-[#2F6BFF] mb-1">R50,000 Account</div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    10% Profit Target
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    5% Max Drawdown
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Unlimited Trading Period
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Scale Up to R100k
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-gradient-to-r from-[#2F6BFF] to-[#2F6BFF] hover:from-[#2F6BFF] hover:to-[#FFA62B] text-white px-6 py-3 rounded-xl text-body-dashboard font-semibold transition-all duration-300 shadow-lg shadow-[#2F6BFF]/30"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Tier IV Plan */}
                        <div className="p-8 rounded-2xl border border-[#2F6BFF]/20 bg-[#16124A] hover:border-[#2F6BFF] transition-all duration-300">
                            <h3 className="text-xl md:text-2xl text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] mb-2 font-semibold">Tier IV</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] font-tabular">R15,000</span>
                                <span className="text-body-dashboard text-gray-200"> One-Time</span>
                            </div>
                            <div className="mb-6">
                                <div className="text-lg font-semibold text-[#2F6BFF] mb-1">R250,000 Account</div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    10% Profit Target
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    5% Max Drawdown
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Unlimited Trading Period
                                </li>
                                <li className="flex items-center text-body-dashboard text-gray-200">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Scale Up to R2.5m
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-[#0B0633] hover:bg-[#2F6BFF]/10 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-gray-100 px-6 py-3 rounded-xl text-body-dashboard font-semibold transition-all duration-300"
                            >
                                Get Started
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
                    <h2 className="text-3xl md:text-5xl font-normal text-white mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] uppercase">
                        READY TO START TRADING?
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
        </PageContainer >
    );
}


export default Landing;
