import { ContentWrapper, PageCard, PageContainer, PageGrid, PageSection, Stack, StatsCard } from '@/components/ui/PageLayoutEnhanced';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { ArrowRight, BarChart3, CheckCircle2, DollarSign, Gift, Shield, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function Partners() {
    const commissionTiers = [
        {
            tier: 'Starter',
            referrals: '1-10',
            commission: '15%',
            features: ['Basic analytics', 'Email support', 'Marketing materials']
        },
        {
            tier: 'Growth',
            referrals: '11-50',
            commission: '20%',
            features: ['Advanced analytics', 'Priority support', 'Custom landing pages', 'Monthly bonuses']
        },
        {
            tier: 'Elite',
            referrals: '51+',
            commission: '30%',
            features: ['Real-time analytics', 'Dedicated account manager', 'Custom campaigns', 'Quarterly bonuses', 'Exclusive events']
        }
    ];

    const partnerTypes = [
        {
            icon: Users,
            title: 'Influencers & Content Creators',
            description: 'Monetize your audience by sharing LemoTick with your followers. Perfect for trading educators, YouTubers, and social media influencers.',
            benefits: ['Custom promo codes', 'Exclusive content access', 'Co-marketing opportunities']
        },
        {
            icon: Target,
            title: 'Trading Communities',
            description: 'Offer your community members access to funded trading accounts. Ideal for Discord servers, Telegram groups, and trading forums.',
            benefits: ['Group discounts', 'Community dashboard', 'Bulk onboarding support']
        },
        {
            icon: BarChart3,
            title: 'Affiliate Marketers',
            description: 'Add LemoTick to your portfolio of financial products. High conversion rates and competitive payouts for performance marketers.',
            benefits: ['API integration', 'Sub-affiliate tracking', 'Advanced attribution']
        },
        {
            icon: Zap,
            title: 'Trading Educators',
            description: 'Provide your students with a path to funded trading. Earn commissions while helping traders succeed with real capital.',
            benefits: ['Educational resources', 'Student tracking', 'Performance insights']
        }
    ];

    const benefits = [
        'Lifetime recurring commissions on all referral activity',
        'Real-time tracking dashboard with detailed analytics',
        'Bi-weekly commission payouts via bank transfer',
        'Professional marketing materials and creatives',
        'Dedicated partner support team',
        'No minimum payout threshold',
        'Cookie duration: 90 days',
        'Access to exclusive partner webinars and training'
    ];

    return (
        <div className="min-h-screen bg-[#B1B1C1] relative overflow-hidden">
            {/* Animated Background Effects - Matching Enhanced Pages */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-blue/40 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-accent-orange/40 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/30 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <PageContainer maxWidth="lg" className="relative z-10">
                {/* Hero Section */}
                <PublicPageHeader page="partners" />

                {/* Key Stats */}
                <PageSection spacing="normal">
                    <PageGrid cols={4} gap="sm">
                        <StatsCard
                            icon={<DollarSign className="w-6 h-6" />}
                            value="30%"
                            label="Max Commission"
                        />
                        <StatsCard
                            icon={<Target className="w-6 h-6" />}
                            value="90"
                            label="Day Cookie"
                        />
                        <StatsCard
                            icon={<Gift className="w-6 h-6" />}
                            value="R0"
                            label="Min Payout"
                        />
                        <StatsCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            value="14"
                            label="Day Payouts"
                        />
                    </PageGrid>
                </PageSection>

                {/* Commission Tiers */}
                <PageSection spacing="normal">
                    <ContentWrapper maxWidth="text">
                        <Stack spacing="sm" className="text-center">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">COMMISSION STRUCTURE</h2>
                            <p className="text-base text-gray-200">Earn more as you grow your referral network</p>
                        </Stack>
                    </ContentWrapper>
                    <PageGrid cols={3} gap="sm" className="mt-8">
                        {commissionTiers.map((tier, index) => (
                            <PageCard
                                key={index}
                                padding="md"
                                className={index === 2 ? 'bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 border-2 border-brand-blue' : 'border-2'}
                            >
                                <Stack spacing="md">
                                    {index === 2 && (
                                        <div className="inline-block bg-gradient-to-r from-brand-blue to-accent-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                                            HIGHEST TIER
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-white">{tier.tier}</h3>
                                    <div className="text-sm text-gray-400">{tier.referrals} Active Referrals</div>
                                    <div className="text-4xl font-bold text-brand-blue">{tier.commission}</div>
                                    <Stack spacing="xs">
                                        {tier.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                                                <span className="text-sm text-white">{feature}</span>
                                            </div>
                                        ))}
                                    </Stack>
                                </Stack>
                            </PageCard>
                        ))}
                    </PageGrid>
                </PageSection>

                {/* Partner Types */}
                <PageSection spacing="normal">
                    <ContentWrapper maxWidth="text">
                        <Stack spacing="sm" className="text-center">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">WHO CAN BECOME A PARTNER?</h2>
                            <p className="text-base text-gray-200">We work with diverse partners across the trading ecosystem</p>
                        </Stack>
                    </ContentWrapper>
                    <PageGrid cols={2} gap="sm" className="mt-8">
                        {partnerTypes.map((type, index) => {
                            const Icon = type.icon;
                            return (
                                <PageCard key={index} padding="md" className="hover:border-brand-blue/40">
                                    <Stack spacing="md">
                                        <Icon className="w-12 h-12 text-brand-blue" />
                                        <h3 className="text-xl font-bold text-white">{type.title}</h3>
                                        <p className="text-white">{type.description}</p>
                                        <Stack spacing="xs">
                                            {type.benefits.map((benefit, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <ArrowRight className="w-4 h-4 text-brand-blue" />
                                                    <span className="text-sm text-gray-400">{benefit}</span>
                                                </div>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </PageCard>
                            );
                        })}
                    </PageGrid>
                </PageSection>

                {/* Benefits Grid */}
                <PageSection spacing="normal">
                    <ContentWrapper maxWidth="text">
                        <Stack spacing="sm" className="text-center">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">PARTNER BENEFITS</h2>
                            <p className="text-base text-gray-200">Everything you need to succeed as a LemoTick partner</p>
                        </Stack>
                    </ContentWrapper>
                    <PageGrid cols={2} gap="sm" className="mt-8">
                        {benefits.map((benefit, index) => (
                            <PageCard key={index} padding="sm" className="bg-[#16124A]/20 border-brand-blue/10">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                                    <span className="text-white">{benefit}</span>
                                </div>
                            </PageCard>
                        ))}
                    </PageGrid>
                </PageSection>

                {/* How It Works */}
                <PageSection spacing="normal">
                    <ContentWrapper maxWidth="text">
                        <Stack spacing="sm" className="text-center">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">HOW IT WORKS</h2>
                            <p className="text-base text-gray-200">Start earning in three simple steps</p>
                        </Stack>
                    </ContentWrapper>
                    <PageGrid cols={3} gap="sm" className="mt-8">
                        <div className="text-center">
                            <Stack spacing="md">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-blue to-accent-orange flex items-center justify-center text-xl font-bold text-white mx-auto">
                                    1
                                </div>
                                <h3 className="text-xl font-bold text-white">Sign Up</h3>
                                <p className="text-gray-400">
                                    Register for our partner program and get instant access to your unique referral link and dashboard
                                </p>
                            </Stack>
                        </div>
                        <div className="text-center">
                            <Stack spacing="md">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-blue to-accent-orange flex items-center justify-center text-xl font-bold text-white mx-auto">
                                    2
                                </div>
                                <h3 className="text-xl font-bold text-white">Share & Promote</h3>
                                <p className="text-gray-400">
                                    Share your link with your audience using our marketing materials, content, and promotional tools
                                </p>
                            </Stack>
                        </div>
                        <div className="text-center">
                            <Stack spacing="md">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-blue to-accent-orange flex items-center justify-center text-xl font-bold text-white mx-auto">
                                    3
                                </div>
                                <h3 className="text-xl font-bold text-white">Earn Commissions</h3>
                                <p className="text-gray-400">
                                    Receive bi-weekly payouts for every evaluation purchase made by your referrals - for life
                                </p>
                            </Stack>
                        </div>
                    </PageGrid>
                </PageSection>

                {/* Why Partner With Us */}
                <PageSection spacing="normal">
                    <PageCard padding="md" className="bg-gradient-to-br from-[#16124A]/50 to-[#2F6BFF]/10">
                        <Stack spacing="md">
                            <h2 className="text-xl md:text-2xl font-normal text-white text-center uppercase">WHY PARTNER WITH LEMOTICK?</h2>
                            <PageGrid cols={2} gap="sm">
                                <div className="flex gap-4">
                                    <Shield className="w-6 h-6 text-brand-blue shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white  mb-1.5">Trusted Platform</h3>
                                        <p className="text-white">
                                            Partner with a reputable South African prop trading firm with transparent rules and reliable payouts
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <TrendingUp className="w-6 h-6 text-brand-blue shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white  mb-1.5">High Conversion</h3>
                                        <p className="text-white">
                                            Our competitive pricing and one-step evaluation model converts better than traditional multi-phase programs
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <DollarSign className="w-6 h-6 text-brand-blue shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white  mb-1.5">Recurring Revenue</h3>
                                        <p className="text-white">
                                            Earn lifetime commissions on all purchases - not just the first one. Build true passive income
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Gift className="w-6 h-6 text-brand-blue shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white  mb-1.5">Bonus Incentives</h3>
                                        <p className="text-white">
                                            Unlock performance bonuses, higher commission tiers, and exclusive rewards as you grow
                                        </p>
                                    </div>
                                </div>
                            </PageGrid>
                        </Stack>
                    </PageCard>
                </PageSection>

                {/* CTA Section */}
                <PageSection spacing="normal">
                    <PageCard padding="md" className="text-center bg-gradient-to-r from-brand-blue/10 to-accent-orange/10">
                        <Stack spacing="md">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">READY TO START EARNING?</h2>
                            <p className="text-white max-w-2xl mx-auto">
                                Join hundreds of partners already earning commissions with LemoTick. No approval required - start promoting today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="inline-block bg-gradient-to-r from-brand-blue to-accent-orange text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    Join Partner Program
                                </Link>
                                <a
                                    href="mailto:partnerships@lemotick.com"
                                    className="inline-block bg-[#16124A] hover:bg-brand-blue/20 border border-brand-blue/30 hover:border-brand-blue text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300"
                                >
                                    Contact Partnerships Team
                                </a>
                            </div>
                        </Stack>
                    </PageCard>
                </PageSection>
            </PageContainer>
        </div>
    );
}

export default Partners;




