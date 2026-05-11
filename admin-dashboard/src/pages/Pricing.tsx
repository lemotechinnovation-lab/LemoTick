import { ContentWrapper, PageCard, PageContainer, PageGrid, PageSection, Stack } from '@/components/ui/PageLayoutEnhanced';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { Check, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Pricing() {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const faqs = [
        {
            question: "What's the difference between tiers?",
            answer: "Each tier represents a different account size and evaluation fee. Higher tiers offer larger account sizes and greater scaling potential. All tiers have the same 10% profit target and 5% max drawdown rules."
        },
        {
            question: "Can I upgrade my tier later?",
            answer: "Yes! You can purchase a higher tier evaluation at any time. Your previous evaluation experience will help you succeed faster with larger account sizes."
        },
        {
            question: "Do tiers affect my rewards?",
            answer: "No. All tiers receive the same 80/20 profit split. You keep 80% of all profits regardless of your tier. Higher tiers simply allow you to trade larger accounts and earn proportionally more."
        },
        {
            question: "Is there a scaling plan?",
            answer: "Yes! Tier I-III accounts can scale up to R500k, and Tier IV accounts can scale up to R2.5 million based on consistent performance. Scaling occurs at the end of each quarter with a 25% bonus available for 2% quarterly return with sharpe > 1."
        },
        {
            question: "How does scaling work?",
            answer: "After passing your evaluation and trading for at least one quarter, you become eligible for account scaling. We review your performance metrics including profit consistency, risk management, and sharpe ratio. Successful traders receive increased account sizes."
        },
        {
            question: "How are payouts fully verifiable?",
            answer: "All payouts are delivered directly to your South African bank account via ZAR transfers. You receive detailed payout statements showing your profit calculations, and all transactions are tracked in your dashboard for full transparency."
        }
    ];

    return (
        <PageContainer>
            {/* Hero Section */}
            <PublicPageHeader page="pricing" />

            {/* Pricing Cards Grid - 5 cards */}
            <PageSection spacing="normal">
                <PageGrid cols={5} gap="sm">
                    {/* Starter */}
                    <PageCard padding="md">
                        <Stack spacing="sm">
                            <h3 className="text-xl font-bold text-white">Starter</h3>
                            <div className="text-lg font-semibold text-[#2F6BFF]">R10,000</div>
                            <div>
                                <span className="text-2xl font-bold text-white">R1,500</span>
                                <div className="text-sm text-gray-400">One-Time Fee</div>
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>10% Target</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>5% Drawdown</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Unlimited Period</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Scale to R100k</span>
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            >
                                Get Started
                            </Link>
                        </Stack>
                    </PageCard>

                    {/* Tier I */}
                    <PageCard padding="md">
                        <Stack spacing="sm">
                            <h3 className="text-xl font-bold text-white">Tier I</h3>
                            <div className="text-lg font-semibold text-[#2F6BFF]">R25,000</div>
                            <div>
                                <span className="text-2xl font-bold text-white">R2,500</span>
                                <div className="text-sm text-gray-400">One-Time Fee</div>
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>10% Target</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>5% Drawdown</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Unlimited Period</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Scale to R100k</span>
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            >
                                Get Started
                            </Link>
                        </Stack>
                    </PageCard>

                    {/* Tier II - Most Popular */}
                    <PageCard padding="md" className="border-2 border-[#2F6BFF] relative shadow-lg shadow-[#2F6BFF]/20">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Most Popular
                            </span>
                        </div>
                        <Stack spacing="sm">
                            <h3 className="text-xl font-bold text-white">Tier II</h3>
                            <div className="text-lg font-semibold text-[#2F6BFF]">R50,000</div>
                            <div>
                                <span className="text-2xl font-bold text-white">R4,500</span>
                                <div className="text-sm text-gray-400">One-Time Fee</div>
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>10% Target</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>5% Drawdown</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Unlimited Period</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Scale to R100k</span>
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg"
                            >
                                Get Started
                            </Link>
                        </Stack>
                    </PageCard>

                    {/* Tier III */}
                    <PageCard padding="md">
                        <Stack spacing="sm">
                            <h3 className="text-xl font-bold text-white">Tier III</h3>
                            <div className="text-lg font-semibold text-[#2F6BFF]">R100,000</div>
                            <div>
                                <span className="text-2xl font-bold text-white">R7,500</span>
                                <div className="text-sm text-gray-400">One-Time Fee</div>
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>10% Target</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>5% Drawdown</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Unlimited Period</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Scale to R500k</span>
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            >
                                Get Started
                            </Link>
                        </Stack>
                    </PageCard>

                    {/* Tier IV */}
                    <PageCard padding="md">
                        <Stack spacing="sm">
                            <h3 className="text-xl font-bold text-white">Tier IV</h3>
                            <div className="text-lg font-semibold text-[#2F6BFF]">R250,000</div>
                            <div>
                                <span className="text-2xl font-bold text-white">R15,000</span>
                                <div className="text-sm text-gray-400">One-Time Fee</div>
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>10% Target</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>5% Drawdown</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Unlimited Period</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-300">
                                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span>Scale to R2.5m</span>
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            >
                                Get Started
                            </Link>
                        </Stack>
                    </PageCard>
                </PageGrid>
            </PageSection>

            {/* Key Features Grid */}
            <PageSection spacing="normal">
                <PageGrid cols={3} gap="sm">
                    <PageCard hover={false} className="text-center">
                        <Stack spacing="sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">One-Step Evaluation</h3>
                            <p className="text-sm text-gray-300">All evaluations are one phase. No second phase, ever.</p>
                        </Stack>
                    </PageCard>

                    <PageCard hover={false} className="text-center">
                        <Stack spacing="sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Consistent Rules</h3>
                            <p className="text-sm text-gray-300">10% profit target, 5% max drawdown, no time limit.</p>
                        </Stack>
                    </PageCard>

                    <PageCard hover={false} className="text-center">
                        <Stack spacing="sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Real Rewards</h3>
                            <p className="text-sm text-gray-300">Funded traders receive bi-weekly payouts based on realized PnL.</p>
                        </Stack>
                    </PageCard>

                    <PageCard hover={false} className="text-center">
                        <Stack spacing="sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-[#FFA62B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">80/20 Profit Split</h3>
                            <p className="text-sm text-gray-300">You earned it? You keep 80%. Every dollar of earned rewards goes to you.</p>
                        </Stack>
                    </PageCard>

                    <PageCard hover={false} className="text-center">
                        <Stack spacing="sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Account Scaling</h3>
                            <p className="text-sm text-gray-300">Scale your account up to R2.5 million with consistent performance.</p>
                        </Stack>
                    </PageCard>

                    <PageCard hover={false} className="text-center">
                        <Stack spacing="sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Transparent System</h3>
                            <p className="text-sm text-gray-300">No hidden rules, surprise charges, or withdrawal fees.</p>
                        </Stack>
                    </PageCard>
                </PageGrid>
            </PageSection>

            {/* Value Proposition Section */}
            <PageSection spacing="normal">
                <PageCard hover={false} padding="lg" className="bg-gradient-to-br from-[#16124A]/50 to-[#0B0633]/50">
                    <ContentWrapper maxWidth="wide" align="center">
                        <Stack spacing="md">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">
                                A MODEL BUILT FOR TRADERS
                            </h2>
                            <p className="text-base text-gray-300">
                                Your Evaluation fee grants access to:
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4 text-left">
                                    <Check className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-1">Funded Account Upon Completion</h4>
                                        <p className="text-gray-300">Pass the evaluation and immediately start trading with a funded account</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-left">
                                    <Check className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-1">Verifiable Performance Rewards</h4>
                                        <p className="text-gray-300">All payouts tracked and delivered directly to your bank account</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-left">
                                    <Check className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-1">80/20 Profit Split</h4>
                                        <p className="text-gray-300">You keep 80% of every dollar you earn - no exceptions</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-left">
                                    <Check className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-1">System Designed for Success</h4>
                                        <p className="text-gray-300">Clear rules, unlimited time, and real support for your trading journey</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-lg">
                                No hidden rules, surprise charges, or withdrawal fees.
                            </p>
                        </Stack>
                    </ContentWrapper>
                </PageCard>
            </PageSection>

            {/* FAQ Section */}
            <PageSection spacing="normal">
                <ContentWrapper maxWidth="wide" align="center">
                    <Stack spacing="md">
                        <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">
                            FREQUENTLY ASKED QUESTIONS
                        </h2>
                        <p className="text-base text-gray-300">
                            Find quick answers
                        </p>
                    </Stack>
                </ContentWrapper>
                <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-1">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border-b border-gray-700/50 py-6"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full text-left flex items-start justify-between gap-4 group"
                            >
                                <span className="text-base font-medium text-white group-hover:text-[#2F6BFF] transition-colors flex-1">
                                    <span className="text-gray-500 mr-2">—</span>
                                    {faq.question}
                                </span>
                                {expandedFAQ === index ? (
                                    <Minus className="w-4 h-4 text-[#2F6BFF] shrink-0 mt-1" />
                                ) : (
                                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#2F6BFF] shrink-0 mt-1 transition-colors" />
                                )}
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${expandedFAQ === index ? 'max-h-96 mt-4' : 'max-h-0'
                                    }`}
                            >
                                <p className="text-gray-400 leading-relaxed text-sm pl-5">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </PageSection>
        </PageContainer>
    );
}

export default Pricing;
