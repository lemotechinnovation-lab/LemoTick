import {
    ContentWrapper,
    PageCard,
    PageContainer,
    PageGrid,
    PageSection,
    Stack,
    StatsCard
} from '@/components/ui/PageLayoutEnhanced';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { Award, CheckCircle, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function About() {
    return (
        <PageContainer maxWidth="lg">
            {/* Hero Section */}
            <PublicPageHeader page="about" />

            {/* Our Mission */}
            <PageSection spacing="normal">
                <ContentWrapper maxWidth="normal" align="center">
                    <Stack spacing="md">
                        <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">
                            OUR MISSION
                        </h2>
                        <p className="text-base text-gray-300 leading-relaxed">
                            To create the most transparent, trader-aligned prop trading platform in South Africa — one that removes conflicts of interest, delivers verifiable payouts, and recognizes real skill.
                        </p>
                    </Stack>
                </ContentWrapper>
            </PageSection>

            {/* Our Philosophy */}
            <PageSection spacing="normal">
                <ContentWrapper maxWidth="wide" align="center">
                    <h2 className="text-xl md:text-2xl font-normal text-white mb-12 uppercase text-center">
                        OUR PHILOSOPHY
                    </h2>
                </ContentWrapper>
                <PageGrid cols={4} gap="sm">
                    <PageCard padding="sm" className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Users className="w-6 h-6 text-[#2F6BFF]" />
                        </div>
                        <h3 className="text-lg font-bold text-white  mb-1.5">Put Traders First</h3>
                        <p className="text-sm text-gray-300">Your success is our success</p>
                    </PageCard>
                    <PageCard padding="sm" className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-[#2F6BFF]" />
                        </div>
                        <h3 className="text-lg font-bold text-white  mb-1.5">Deliver Verifiable Payouts</h3>
                        <p className="text-sm text-gray-300">Transparent and trackable</p>
                    </PageCard>
                    <PageCard padding="sm" className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-6 h-6 text-[#2F6BFF]" />
                        </div>
                        <h3 className="text-lg font-bold text-white  mb-1.5">Remove Hidden Rules</h3>
                        <p className="text-sm text-gray-300">Clear and consistent</p>
                    </PageCard>
                    <PageCard padding="sm" className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-6 h-6 text-[#2F6BFF]" />
                        </div>
                        <h3 className="text-lg font-bold text-white  mb-1.5">Offer Scaling Opportunities</h3>
                        <p className="text-sm text-gray-300">Grow to R2.5 million</p>
                    </PageCard>
                </PageGrid>
            </PageSection>

            {/* The LemoTick Difference */}
            <PageSection spacing="normal">
                <ContentWrapper maxWidth="wide" align="center">
                    <h2 className="text-xl md:text-2xl font-normal text-white mb-12 uppercase text-center">
                        THE LEMOTICK DIFFERENCE
                    </h2>
                </ContentWrapper>
                <PageGrid cols={3} gap="sm">
                    <PageCard padding="md" className="bg-gradient-to-br from-[#16124A]/50 to-[#0B0633]/50">
                        <Stack spacing="md">
                            <div className="text-4xl font-bold text-[#2F6BFF]">80/20</div>
                            <h3 className="text-xl font-bold text-white">Profit Split</h3>
                            <p className="text-gray-300">
                                You keep 80% of your performance profits. It's that simple.
                            </p>
                            <p className="text-[#FFA62B] font-semibold">
                                This is how we put traders first.
                            </p>
                        </Stack>
                    </PageCard>

                    <PageCard padding="md" className="bg-gradient-to-br from-[#16124A]/50 to-[#0B0633]/50">
                        <Stack spacing="md">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Verifiable Payouts</h3>
                            <p className="text-gray-300">
                                All payouts are tracked and delivered directly to your South African bank account.
                            </p>
                            <p className="text-[#FFA62B] font-semibold">
                                Delivered on-time, every time.
                            </p>
                        </Stack>
                    </PageCard>

                    <PageCard padding="md" className="bg-gradient-to-br from-[#16124A]/50 to-[#0B0633]/50">
                        <Stack spacing="md">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">The LemoTick Evaluation</h3>
                            <p className="text-gray-300">
                                One-step. 10% profit target. 5% max drawdown. Pass and earn your funded account.
                            </p>
                            <p className="text-[#FFA62B] font-semibold">
                                Simple and transparent.
                            </p>
                        </Stack>
                    </PageCard>
                </PageGrid>
            </PageSection>

            {/* Real Scaling Opportunities */}
            <PageSection spacing="normal">
                <PageCard padding="md" className="bg-gradient-to-br from-[#16124A]/50 to-[#0B0633]/50">
                    <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] rounded-xl flex items-center justify-center shrink-0">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <Stack spacing="md" className="flex-1">
                            <h3 className="text-xl md:text-xl font-bold text-white">Real Scaling Opportunities</h3>
                            <p className="text-base text-gray-300">
                                Industry-leading quarterly scaling, with Tier IV accounts eligible for up to <strong className="text-[#2F6BFF]">R2.5 million</strong> in capital. Tiers I-III can scale up to <strong className="text-[#2F6BFF]">R500,000</strong>.
                            </p>
                            <p className="text-gray-400">
                                Meet the quarterly requirements (2% return + Sharpe ≥ 1.0) and receive a 25% performance bonus on top of your 80/20 split.
                            </p>
                        </Stack>
                    </div>
                </PageCard>
            </PageSection>

            {/* A Trusted Team */}
            <PageSection spacing="normal">
                <ContentWrapper maxWidth="wide" align="center">
                    <Stack spacing="md" className="mb-12">
                        <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">
                            A TRUSTED TEAM OF BUILDERS
                        </h2>
                        <p className="text-base text-gray-300 leading-relaxed">
                            LemoTick is built by experienced traders, engineers, and financial professionals focused on modernizing prop trading fairly and transparently in South Africa.
                        </p>
                    </Stack>
                </ContentWrapper>

                <PageGrid cols={2} gap="sm">
                    <PageCard padding="md">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <p className="text-gray-300">Transparent infrastructure and clear rules</p>
                        </div>
                    </PageCard>
                    <PageCard padding="md">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <p className="text-gray-300">Immutable performance records and tracking</p>
                        </div>
                    </PageCard>
                    <PageCard padding="md">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <p className="text-gray-300">Verifiable payouts that cannot be denied</p>
                        </div>
                    </PageCard>
                    <PageCard padding="md">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <p className="text-gray-300">A fair system that removes human discretion</p>
                        </div>
                    </PageCard>
                </PageGrid>

                <PageCard padding="md" className="mt-8 bg-gradient-to-r from-[#2F6BFF]/10 to-[#FFA62B]/10">
                    <p className="text-center text-base text-gray-300">
                        This foundation allows LemoTick to deliver the most transparent and trustworthy payout system in the South African prop trading industry.
                    </p>
                </PageCard>
            </PageSection>

            {/* Stats */}
            <PageSection spacing="normal" background="gradient" fullWidth>
                <PageGrid cols={3} gap="sm">
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
                        icon={<Award className="w-6 h-6" />}
                        value="99.9%"
                        label="Uptime"
                    />
                </PageGrid>
            </PageSection>

            {/* The Platform Where Traders Get Paid */}
            <PageSection spacing="normal">
                <ContentWrapper maxWidth="wide" align="center">
                    <Stack spacing="md" className="mb-12">
                        <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">
                            THE PLATFORM WHERE TRADERS GET PAID
                        </h2>
                        <p className="text-base text-gray-300 leading-relaxed">
                            LemoTick's long-term vision is to become the standard for prop trading in South Africa, offering a transparent path to performance rewards for elite traders.
                        </p>
                    </Stack>
                </ContentWrapper>

                <PageCard padding="md" className="bg-gradient-to-br from-[#16124A]/50 to-[#0B0633]/50">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">We believe in a prop model where:</h3>
                    <PageGrid cols={2} gap="sm" className="max-w-3xl mx-auto">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-[#2F6BFF] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-1">Rules are transparent</h4>
                                <p className="text-sm text-gray-400">No hidden conditions or surprise requirements</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-[#2F6BFF] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-1">Payouts are verifiable</h4>
                                <p className="text-sm text-gray-400">Track every payment from start to finish</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-[#2F6BFF] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-1">Traders are respected</h4>
                                <p className="text-sm text-gray-400">Your success is our priority</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-[#2F6BFF] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-1">Infrastructure is reliable</h4>
                                <p className="text-sm text-gray-400">Built on proven technology and processes</p>
                            </div>
                        </div>
                    </PageGrid>
                </PageCard>

                <ContentWrapper maxWidth="normal" align="center">
                    <Stack spacing="sm" className="mt-8">
                        <p className="text-base text-gray-300">
                            We're not just building another trading platform —
                        </p>
                        <p className="text-xl font-bold text-[#2F6BFF]">
                            We're delivering a new foundation for trust in prop trading.
                        </p>
                    </Stack>
                </ContentWrapper>
            </PageSection>

            {/* CTA */}
            <PageSection spacing="normal">
                <PageCard padding="md" className="text-center bg-gradient-to-r from-[#2F6BFF]/10 to-[#FFA62B]/10">
                    <ContentWrapper maxWidth="normal" align="center">
                        <Stack spacing="md">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">
                                BEGIN YOUR TRADING JOURNEY
                            </h2>
                            <p className="text-base text-gray-300">
                                Join the platform for traders who want verifiable performance payouts, full transparency, and world-class scaling opportunities.
                            </p>
                            <Link
                                to="/register"
                                className="inline-block bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-10 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                Take the LemoTick Evaluation
                            </Link>
                        </Stack>
                    </ContentWrapper>
                </PageCard>
            </PageSection>
        </PageContainer>
    );
}

export default About;
