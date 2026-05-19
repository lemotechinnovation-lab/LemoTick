import { ContentWrapper, PageCard, PageContainer, PageGrid, PageSection, Stack } from '@/components/ui/PageLayoutEnhanced';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import {
    Award,
    BarChart3,
    CheckCircle,
    Clock, DollarSign,
    Shield,
    Target,
    TrendingUp,
    UserPlus,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function HowItWorks() {
    // State for active tab in journey steps
    const [activeStep, setActiveStep] = useState<number>(1);

    // Data structures
    const steps = [
        {
            number: 1,
            icon: UserPlus,
            title: "TAKE THE LEMOTICK EVALUATION",
            subtitle: "Evaluation",
            goal: "Your first step is the LemoTick Evaluation — a test of skill built to measure your trading performance, not endurance.",
            details: [
                "Reach the 10% profit target while staying within the 5% daily and EOD trailing drawdown thresholds",
                "Choose your account size tier based on your trading capital",
                "Begin trading on our advanced platform with real-time market data",
                "Achieve the profit target while managing risk within the parameters"
            ]
        },
        {
            number: 2,
            icon: Target,
            title: "PROVE YOUR TRADING SKILLS",
            subtitle: "Verification",
            goal: "Once you pass the Evaluation, you can begin earning with LemoTick on a Funded Account. No phase two, no delays.",
            details: [
                "Trade consistently and stay within the risk parameters",
                "You keep 80% of the profits you earn",
                "Your performance is recorded and verified in real-time",
                "Your risk limits increase to 8% daily and EOD drawdown"
            ]
        },
        {
            number: 3,
            icon: DollarSign,
            title: "EARN PROFITS",
            subtitle: "Payouts",
            goal: "After 7 days of trading on your Funded Account, your profits are delivered bi-weekly based on your realized PnL.",
            details: [
                "Verifiable profit payouts tracked through our platform",
                "80/20 profit split - you keep 80% of all profits",
                "ZAR payouts delivered directly to your South African bank account",
                "Example: Generate R5,200 profit on your R100,000 account, receive R4,160 payout"
            ]
        },
        {
            number: 4,
            icon: TrendingUp,
            title: "SCALE YOUR ACCOUNT",
            subtitle: "Growth",
            goal: "Perform consistently to increase your account size or receive a quarterly performance bonus.",
            details: [
                "Qualifications: 5% quarterly return and sharpe ratio greater than 1",
                "Scaling occurs at the end of each quarter",
                "25% bonus available for 2% quarterly return with sharpe > 1",
                "Tier I-III accounts can scale to R500k, Tier IV to R2.5 million"
            ]
        }
    ];

    const evaluationCriteria = [
        {
            icon: Target,
            title: "Profit Target",
            description: "Achieve 10% profit on your account",
            metric: "10%"
        },
        {
            icon: Shield,
            title: "Maximum Drawdown",
            description: "Stay within 5% daily loss limit",
            metric: "5%"
        },
        {
            icon: Clock,
            title: "Trading Days",
            description: "No time limit - trade at your pace",
            metric: "Unlimited"
        }
    ];

    const profitTargets = [
        {
            level: 1,
            percentage: "10%",
            title: "Phase 1 Target",
            description: "Reach your first milestone",
            reward: "Advance to Phase 2",
            color: "from-brand-blue to-[#3B82F6]"
        },
        {
            level: 2,
            percentage: "5%",
            title: "Phase 2 Target",
            description: "Prove consistency",
            reward: "Get Funded Account",
            color: "from-[#FFA62B] to-[#FF8C00]"
        }
    ];

    const scalingTiers = [
        {
            tier: 1,
            capital: "R10,000",
            title: "Starter Tier",
            requirements: [
                "Complete Phase 1 & 2",
                "Maintain 5% max drawdown",
                "5 minimum trading days"
            ],
            icon: Users
        },
        {
            tier: 2,
            capital: "R100,000",
            title: "Professional Tier",
            requirements: [
                "Consistent profitability",
                "8% max drawdown",
                "Quarterly performance review"
            ],
            icon: BarChart3
        },
        {
            tier: 3,
            capital: "R500,000",
            title: "Elite Tier",
            requirements: [
                "Proven track record",
                "Advanced risk management",
                "Sharpe ratio > 1"
            ],
            icon: Award
        }
    ];

    const pricingPlans = [
        {
            name: "Starter",
            accountSize: "R10,000",
            price: "R1,500",
            period: "One-Time Fee",
            profitTarget: "10%",
            maxDrawdown: "5%",
            tradingPeriod: "Unlimited",
            accountScaling: "Up to R100k",
            cta: "Get Started",
            ctaLink: "/register"
        },
        {
            name: "Tier I",
            accountSize: "R25,000",
            price: "R2,500",
            period: "One-Time Fee",
            profitTarget: "10%",
            maxDrawdown: "5%",
            tradingPeriod: "Unlimited",
            accountScaling: "Up to R100k",
            cta: "Get Started",
            ctaLink: "/register"
        },
        {
            name: "Tier II",
            accountSize: "R50,000",
            price: "R4,500",
            period: "One-Time Fee",
            profitTarget: "10%",
            maxDrawdown: "5%",
            tradingPeriod: "Unlimited",
            accountScaling: "Up to R100k",
            popular: true,
            cta: "Get Started",
            ctaLink: "/register"
        },
        {
            name: "Tier III",
            accountSize: "R100,000",
            price: "R7,500",
            period: "One-Time Fee",
            profitTarget: "10%",
            maxDrawdown: "5%",
            tradingPeriod: "Unlimited",
            accountScaling: "Up to R500k",
            cta: "Get Started",
            ctaLink: "/register"
        },
        {
            name: "Tier IV",
            accountSize: "R250,000",
            price: "R15,000",
            period: "One-Time Fee",
            profitTarget: "10%",
            maxDrawdown: "5%",
            tradingPeriod: "Unlimited",
            accountScaling: "Up to R2.5m",
            cta: "Get Started",
            ctaLink: "/register"
        }
    ];

    return (
        <div className="min-h-screen bg-[#B1B1C1] relative overflow-hidden">
            {/* Animated Background Effects - Matching Enhanced Pages */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-blue/40 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-accent-orange/40 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/30 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <PageContainer maxWidth="xl" className="relative z-10">
                {/* Hero Section */}
                <PublicPageHeader page="how-it-works" />

                {/* Step-by-Step Guide Section - Tabbed Interface */}
                <PageSection spacing="normal" background="transparent">
                    <ContentWrapper maxWidth="text" align="center">
                        <Stack spacing="sm" className="text-center">
                            <div className="flex justify-center">
                                <span className="px-4 py-2 bg-gradient-to-r from-brand-blue/20 to-accent-orange/20 border border-brand-blue/30 rounded-full text-xs text-brand-blue font-bold backdrop-blur-sm">
                                    🚀 Your Path to Success
                                </span>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">
                                YOUR JOURNEY IN 4 STEPS
                            </h2>
                            <p className="text-sm text-gray-200 font-medium">
                                From evaluation to scaling - here's how you grow with LemoTick
                            </p>
                        </Stack>
                    </ContentWrapper>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = activeStep === step.number;
                            return (
                                <button
                                    key={step.number}
                                    onClick={() => setActiveStep(step.number)}
                                    className={`px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-brand-blue to-accent-orange shadow-lg shadow-brand-blue/30'
                                        : 'bg-[#16124A]/60 border border-brand-blue/20 hover:border-brand-blue hover:bg-[#16124A]'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-brand-blue/20'
                                            }`}>
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-blue'}`} />
                                        </div>
                                        <div className="text-left">
                                            <div className={`text-xs font-semibold mb-0.5 ${isActive ? 'text-white/90' : 'text-gray-400'}`}>
                                                Step {step.number}
                                            </div>
                                            <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-white'}`}>
                                                {step.subtitle}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="relative mt-6">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = activeStep === step.number;

                            return (
                                <div
                                    key={step.number}
                                    className={`transition-all duration-500 ${isActive
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 absolute inset-0 pointer-events-none translate-y-4'
                                        }`}
                                >
                                    <PageCard padding="md" className="border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.15)]">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {/* Icon and Number */}
                                            <div className="flex-shrink-0">
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center border border-brand-blue/30">
                                                    <Icon className="w-8 h-8 text-brand-blue" />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <Stack spacing="sm">
                                                    <span className="inline-block px-3 py-1 bg-brand-blue/20 border border-brand-blue/30 rounded-full text-xs text-brand-blue font-bold">
                                                        Step {step.number} of 4
                                                    </span>

                                                    <div>
                                                        <h3 className="text-base md:text-lg font-bold text-white mb-2">{step.title}</h3>
                                                        <span className="text-sm text-accent-orange font-bold uppercase tracking-wide">{step.subtitle}</span>
                                                    </div>

                                                    <p className="text-sm text-white leading-relaxed font-medium">{step.goal}</p>

                                                    <Stack spacing="xs">
                                                        {step.details.map((detail, i) => (
                                                            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-[#0B0633]/50 border border-brand-blue/10">
                                                                <CheckCircle className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                                                                <span className="text-white text-xs font-medium">{detail}</span>
                                                            </div>
                                                        ))}
                                                    </Stack>
                                                </Stack>
                                            </div>
                                        </div>
                                    </PageCard>
                                </div>
                            );
                        })}
                    </div>
                </PageSection>

                {/* Evaluation Process Section */}
                <PageSection spacing="normal" background="transparent">
                    <ContentWrapper maxWidth="text" align="center">
                        <Stack spacing="sm" className="text-center">
                            <div className="flex justify-center">
                                <span className="px-4 py-2 bg-gradient-to-r from-brand-blue/20 to-accent-orange/20 border border-brand-blue/30 rounded-full text-xs text-brand-blue font-bold backdrop-blur-sm">
                                    📊 Evaluation Criteria
                                </span>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">
                                WHAT WE MEASURE
                            </h2>
                            <p className="text-sm text-gray-200 font-medium">
                                Simple, transparent criteria to prove your trading skills
                            </p>
                        </Stack>
                    </ContentWrapper>

                    <PageGrid cols={3} gap="sm" className="mt-6">
                        {evaluationCriteria.map((criterion, index) => {
                            const Icon = criterion.icon;
                            return (
                                <PageCard key={index} hover className="hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] transition-all duration-300">
                                    <Stack spacing="sm">
                                        <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-xl flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-brand-blue" />
                                        </div>
                                        <h3 className="text-sm font-bold text-white">{criterion.title}</h3>
                                        <p className="text-white font-medium text-xs">{criterion.description}</p>
                                        <div className="inline-block px-3 py-1.5 bg-brand-blue/20 border border-brand-blue/30 rounded-full">
                                            <span className="text-brand-blue font-bold text-sm">{criterion.metric}</span>
                                        </div>
                                    </Stack>
                                </PageCard>
                            );
                        })}
                    </PageGrid>
                </PageSection>

                {/* Profit Targets Section */}
                <PageSection spacing="normal" background="transparent">
                    <ContentWrapper maxWidth="text" align="center">
                        <Stack spacing="sm" className="text-center">
                            <div className="flex justify-center">
                                <span className="px-4 py-2 bg-gradient-to-r from-brand-blue/20 to-accent-orange/20 border border-brand-blue/30 rounded-full text-xs text-brand-blue font-bold backdrop-blur-sm">
                                    🎯 Profit Milestones
                                </span>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">
                                YOUR PATH TO FUNDING
                            </h2>
                            <p className="text-sm text-gray-200 font-medium">
                                Two phases to prove your consistency and earn your funded account
                            </p>
                        </Stack>
                    </ContentWrapper>

                    <PageGrid cols={2} gap="sm" className="mt-6">
                        {profitTargets.map((target) => (
                            <PageCard key={target.level} className="bg-gradient-to-br from-[#16124A] to-[#0B0633] border border-brand-blue/30 shadow-[0_0_20px_rgba(47,107,255,0.15)]">
                                <Stack spacing="sm">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide font-bold">Phase {target.level}</span>
                                    <div className={`text-3xl font-bold bg-gradient-to-r ${target.color} bg-clip-text text-transparent`}>
                                        {target.percentage}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-2">{target.title}</h3>
                                        <p className="text-white font-medium text-xs">{target.description}</p>
                                    </div>
                                    <div className="inline-block px-3 py-1.5 bg-accent-orange/20 border border-[#FFA62B]/30 rounded-full">
                                        <span className="text-accent-orange font-bold text-xs">✓ {target.reward}</span>
                                    </div>
                                </Stack>
                            </PageCard>
                        ))}
                    </PageGrid>
                </PageSection>

                {/* Scaling Options Section */}
                <PageSection spacing="normal" background="transparent">
                    <ContentWrapper maxWidth="text" align="center">
                        <Stack spacing="sm" className="text-center">
                            <div className="flex justify-center">
                                <span className="px-4 py-2 bg-gradient-to-r from-brand-blue/20 to-accent-orange/20 border border-brand-blue/30 rounded-full text-xs text-brand-blue font-bold backdrop-blur-sm">
                                    📈 Account Growth
                                </span>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">
                                SCALE YOUR TRADING CAPITAL
                            </h2>
                            <p className="text-sm text-gray-200 font-medium">
                                Grow from starter to elite tier based on your performance
                            </p>
                        </Stack>
                    </ContentWrapper>

                    <PageGrid cols={3} gap="sm" className="mt-6">
                        {scalingTiers.map((tier) => {
                            const Icon = tier.icon;
                            return (
                                <PageCard key={tier.tier} hover className="hover:shadow-[0_0_20px_rgba(47,107,255,0.2)] transition-all duration-300">
                                    <Stack spacing="sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-brand-blue" />
                                            </div>
                                            <span className="text-xs text-gray-400 font-bold">Tier {tier.tier}</span>
                                        </div>
                                        <div className="text-lg font-bold text-brand-blue">{tier.capital}</div>
                                        <h3 className="text-sm font-bold text-white">{tier.title}</h3>
                                        <Stack spacing="xs">
                                            {tier.requirements.map((req, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-xs text-white font-medium">{req}</span>
                                                </div>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </PageCard>
                            );
                        })}
                    </PageGrid>
                </PageSection>

                {/* Evaluation Targets & Pricing Section */}
                <PageSection spacing="normal" background="transparent">
                    <ContentWrapper maxWidth="text" align="center">
                        <Stack spacing="sm" className="text-center">
                            <div className="flex justify-center">
                                <span className="px-4 py-2 bg-gradient-to-r from-brand-blue/20 to-accent-orange/20 border border-brand-blue/30 rounded-full text-xs text-brand-blue font-bold backdrop-blur-sm">
                                    💰 Pricing
                                </span>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">
                                CHOOSE YOUR ACCOUNT SIZE
                            </h2>
                            <p className="text-sm text-gray-200 font-medium">
                                One-time fee for lifetime access to your evaluation
                            </p>
                        </Stack>
                    </ContentWrapper>

                    {/* Evaluation Targets Summary */}
                    <PageCard className="mt-6 bg-gradient-to-r from-[#16124A] to-[#0B0633] border border-brand-blue/30">
                        <Stack spacing="sm">
                            <h3 className="text-base md:text-lg font-bold text-white text-center uppercase tracking-tight">EVALUATION TARGETS & RULES</h3>
                            <PageGrid cols={5} gap="sm">
                                <div className="text-center">
                                    <div className="text-xs text-gray-400 mb-1 font-semibold">Profit Target</div>
                                    <div className="text-lg font-bold text-brand-blue">10%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-400 mb-1 font-semibold">Max Drawdown</div>
                                    <div className="text-lg font-bold text-accent-orange">5%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-400 mb-1 font-semibold">Maximum Days</div>
                                    <div className="text-lg font-bold text-white">Unlimited</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-400 mb-1 font-semibold">Minimum Days</div>
                                    <div className="text-lg font-bold text-white">None</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-400 mb-1 font-semibold">Markets</div>
                                    <div className="text-sm font-bold text-white">All Assets</div>
                                </div>
                            </PageGrid>
                        </Stack>
                    </PageCard>

                    {/* Pricing Cards */}
                    <PageGrid cols={5} gap="sm" className="mt-6">
                        {pricingPlans.map((plan) => (
                            <PageCard
                                key={plan.name}
                                hover
                                className={`${plan.popular
                                    ? 'border border-brand-blue shadow-[0_0_20px_rgba(47,107,255,0.2)] relative'
                                    : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-brand-blue to-accent-orange text-white px-3 py-1 rounded-full text-xs font-bold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-sm font-bold text-white mb-2">{plan.name}</h3>
                                <div className="text-base font-bold text-brand-blue mb-1">{plan.accountSize}</div>
                                <div className="text-xs text-gray-400 mb-4 font-medium">{plan.period}</div>
                                <div className="text-lg font-bold text-white mb-6">{plan.price}</div>

                                <div className="space-y-2 mb-6 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-medium">Profit Target</span>
                                        <span className="text-white font-bold">{plan.profitTarget}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-medium">Max Drawdown</span>
                                        <span className="text-white font-bold">{plan.maxDrawdown}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-medium">Trading Period</span>
                                        <span className="text-white font-bold">{plan.tradingPeriod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-medium">Scaling</span>
                                        <span className="text-white font-bold">{plan.accountScaling}</span>
                                    </div>
                                </div>

                                <Link
                                    to={plan.ctaLink}
                                    className={`block w-full text-center px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 text-xs ${plan.popular
                                        ? 'bg-gradient-to-r from-brand-blue to-accent-orange text-white hover:shadow-lg hover:scale-105'
                                        : 'bg-[#0B0633] hover:bg-brand-blue/10 border border-brand-blue/30 hover:border-brand-blue text-gray-100'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </PageCard>
                        ))}
                    </PageGrid>
                </PageSection>

                {/* Final CTA Section */}
                <PageSection>
                    <PageCard className="text-center bg-gradient-to-br from-brand-blue/20 via-[#16124A]/40 to-accent-orange/20 border border-brand-blue/30 backdrop-blur-sm shadow-[0_0_20px_rgba(47,107,255,0.15)]" padding="md">
                        <h2 className="text-lg md:text-xl font-bold text-white mb-4 uppercase tracking-tight">READY TO GET STARTED?</h2>
                        <p className="text-white mb-6 max-w-2xl mx-auto text-sm font-medium leading-relaxed">
                            Join <span className="text-brand-blue font-bold">10,000+ traders</span> who trust LemoTick for their trading journey
                        </p>
                        <Link
                            to="/register"
                            className="inline-block bg-gradient-to-r from-brand-blue to-accent-orange text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            Start Your Evaluation →
                        </Link>
                    </PageCard>
                </PageSection>
            </PageContainer>
        </div>
    );
}

export default HowItWorks;




