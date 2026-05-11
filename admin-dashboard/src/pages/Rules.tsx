import { PageCard, PageContainer, PageSection, Stack, TwoColumnLayout } from '@/components/ui/PageLayoutEnhanced';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { AlertTriangle, Award, BookOpen, CheckCircle, DollarSign, Lock, Shield, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Rules() {
    const [activeSection, setActiveSection] = useState<string>('overview');
    const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!scrollContainerRef) return;

        const handleScroll = () => {
            const sections = scrollContainerRef.querySelectorAll('[data-section]');
            let currentSection = 'overview';

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                const containerRect = scrollContainerRef.getBoundingClientRect();
                // Check if section is in view relative to the scroll container
                if (rect.top <= containerRect.top + 100 && rect.bottom >= containerRect.top + 100) {
                    currentSection = section.getAttribute('data-section') || 'overview';
                }
            });

            setActiveSection(currentSection);
        };

        scrollContainerRef.addEventListener('scroll', handleScroll);
        return () => scrollContainerRef.removeEventListener('scroll', handleScroll);
    }, [scrollContainerRef]);

    const scrollToSection = (sectionId: string) => {
        if (!scrollContainerRef) return;

        const element = scrollContainerRef.querySelector(`[data-section="${sectionId}"]`);
        if (element) {
            const containerTop = scrollContainerRef.getBoundingClientRect().top;
            const elementTop = element.getBoundingClientRect().top;
            const offset = 20; // Small offset from top

            scrollContainerRef.scrollTo({
                top: scrollContainerRef.scrollTop + (elementTop - containerTop) - offset,
                behavior: 'smooth'
            });
        }
    };

    const sections = [
        {
            id: 'overview',
            title: 'Overview',
            icon: <BookOpen className="w-6 h-6" />,
            content: (
                <Stack spacing="sm">
                    <p className="text-gray-300 leading-relaxed">
                        LemoTick is a prop trading platform that provides funded accounts to skilled traders. Complete a one-step evaluation to demonstrate consistent profitability, then receive a funded account with an 80/20 profit split, bi-weekly payouts, and the ability to scale up to R2.5 million.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        All payouts are processed transparently and delivered directly to your South African bank account via ZAR transfers. No hidden rules, no surprise charges, no withdrawal fees.
                    </p>
                </Stack>
            )
        },
        {
            id: 'account-tiers',
            title: 'Account Tiers',
            icon: <TrendingUp className="w-6 h-6" />,
            content: (
                <Stack spacing="md">
                    <p className="text-gray-300">LemoTick offers five account tiers, each with different account sizes and scaling potential:</p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-[#2F6BFF]/30">
                                    <th className="text-left p-3 text-gray-400 font-semibold text-sm uppercase">Tier</th>
                                    <th className="text-left p-3 text-gray-400 font-semibold text-sm uppercase">Account Size</th>
                                    <th className="text-left p-3 text-gray-400 font-semibold text-sm uppercase">Evaluation Fee</th>
                                    <th className="text-left p-3 text-gray-400 font-semibold text-sm uppercase">Scale Cap</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                <tr className="border-b border-[#2F6BFF]/10">
                                    <td className="p-3">Starter</td>
                                    <td className="p-3 text-[#2F6BFF] font-semibold">R10,000</td>
                                    <td className="p-3">R1,500</td>
                                    <td className="p-3">R100,000</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10">
                                    <td className="p-3">Tier I</td>
                                    <td className="p-3 text-[#2F6BFF] font-semibold">R25,000</td>
                                    <td className="p-3">R2,500</td>
                                    <td className="p-3">R100,000</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10">
                                    <td className="p-3">Tier II</td>
                                    <td className="p-3 text-[#2F6BFF] font-semibold">R50,000</td>
                                    <td className="p-3">R4,500</td>
                                    <td className="p-3">R100,000</td>
                                </tr>
                                <tr className="border-b border-[#2F6BFF]/10">
                                    <td className="p-3">Tier III</td>
                                    <td className="p-3 text-[#2F6BFF] font-semibold">R100,000</td>
                                    <td className="p-3">R7,500</td>
                                    <td className="p-3">R500,000</td>
                                </tr>
                                <tr>
                                    <td className="p-3">Tier IV</td>
                                    <td className="p-3 text-[#2F6BFF] font-semibold">R250,000</td>
                                    <td className="p-3">R15,000</td>
                                    <td className="p-3">R2,500,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-4">
                        <p className="text-sm text-gray-300"><strong className="text-white">Important:</strong> You cannot upgrade an active evaluation tier. A new evaluation must be purchased. Evaluation fees are non-refundable and cover the infrastructure used to verify performance.</p>
                    </div>
                </Stack>
            )
        },
        {
            id: 'evaluation-rules',
            title: 'Evaluation Rules',
            icon: <Shield className="w-6 h-6" />,
            content: (
                <Stack spacing="md">
                    <p className="text-gray-300">The LemoTick Evaluation is a one-step challenge with clear, consistent rules:</p>

                    <Stack spacing="sm">
                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <Stack spacing="xs">
                                <h4 className="text-base font-bold text-white">Profit Target</h4>
                                <p className="text-gray-300"><strong className="text-[#2F6BFF]">10%</strong> of account balance</p>
                                <p className="text-sm text-gray-400">Example: On a R100,000 account, you need to achieve R10,000 in profit to pass.</p>
                            </Stack>
                        </div>

                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <Stack spacing="xs">
                                <h4 className="text-base font-bold text-white">Maximum Drawdown</h4>
                                <p className="text-gray-300"><strong className="text-[#FFA62B]">5%</strong> maximum drawdown from starting balance</p>
                                <p className="text-sm text-gray-400">Example: On a R100,000 account, your equity cannot drop below R95,000 at any time. Breaching this limit results in immediate elimination.</p>
                            </Stack>
                        </div>

                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <Stack spacing="xs">
                                <h4 className="text-base font-bold text-white">Time Limits & Minimum Days</h4>
                                <ul className="space-y-2 text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                        <span><strong className="text-white">Time limit:</strong> None. The trading period is unlimited.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                        <span><strong className="text-white">Minimum trading days:</strong> None. You can pass in a single day if you hit the target.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                                        <span><strong className="text-white">Activity requirement:</strong> You must place at least one trade within 30 days of account activation.</span>
                                    </li>
                                </ul>
                            </Stack>
                        </div>

                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <Stack spacing="xs">
                                <h4 className="text-base font-bold text-white">No Consistency Rule</h4>
                                <p className="text-gray-300">There is <strong className="text-[#2F6BFF]">no single-day profit cap</strong> or consistency rule. You may generate any proportion of your profits in a single day.</p>
                            </Stack>
                        </div>
                    </Stack>

                    <div className="bg-gradient-to-r from-[#2F6BFF]/10 to-[#FFA62B]/10 border border-[#2F6BFF]/30 rounded-lg p-4">
                        <p className="text-white font-semibold">The full rule set is: profit target + max drawdown. There are no hidden rules.</p>
                    </div>
                </Stack>
            )
        },
        {
            id: 'funded-rules',
            title: 'Funded Account Rules',
            icon: <Award className="w-6 h-6" />,
            content: (
                <Stack spacing="md">
                    <p className="text-gray-300">Once you pass the evaluation, your funded account is activated immediately with the following rules:</p>

                    <Stack spacing="sm">
                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <Stack spacing="xs">
                                <h4 className="text-base font-bold text-white">Drawdown Limit (Funded)</h4>
                                <p className="text-gray-300"><strong className="text-[#FFA62B]">8%</strong> trailing drawdown from the account's high water mark</p>
                                <p className="text-sm text-gray-400">If breached, the funded account is closed. You may attempt the evaluation again.</p>
                            </Stack>
                        </div>

                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <Stack spacing="xs">
                                <h4 className="text-base font-bold text-white">Profit Target (Funded)</h4>
                                <p className="text-gray-300"><strong className="text-[#2F6BFF]">None.</strong> There is no profit target on funded accounts. You trade and receive bi-weekly payouts based on realized profits.</p>
                            </Stack>
                        </div>

                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <Stack spacing="xs">
                                <h4 className="text-base font-bold text-white">Profit Split</h4>
                                <p className="text-gray-300"><strong className="text-[#2F6BFF]">80/20</strong> - You keep 80% of all profits</p>
                                <p className="text-sm text-gray-400">Example: Generate R5,200 profit on your R100,000 account, receive R4,160 payout (80%).</p>
                            </Stack>
                        </div>
                    </Stack>
                </Stack>
            )
        },
        {
            id: 'trading-conditions',
            title: 'Trading Conditions',
            icon: <CheckCircle className="w-6 h-6" />,
            content: (
                <Stack spacing="md">
                    <div>
                        <h4 className="text-base font-bold text-white mb-4">What's Allowed</h4>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span><strong className="text-white">Manual trading</strong> - All manual trading strategies are permitted</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span><strong className="text-white">Algorithmic trading / EAs / bots</strong> - Must be your own strategies</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span><strong className="text-white">News trading</strong> - No restrictions on trading during news events</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span><strong className="text-white">Overnight and weekend holding</strong> - Hold positions across all supported markets</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <span><strong className="text-white">Scalping</strong> - All scalping strategies are allowed</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-base font-bold text-white mb-4">What's Not Allowed</h4>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <span><strong className="text-white">Third-party copy trading</strong> - Using signals, copy trading services, or strategies that are not your own is strictly prohibited</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <span><strong className="text-white">Account sharing</strong> - Each account must be traded by the registered user only</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <span><strong className="text-white">Market manipulation</strong> - Any form of market manipulation or insider trading</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-r from-[#2F6BFF]/10 to-[#FFA62B]/10 border border-[#2F6BFF]/30 rounded-lg p-4">
                        <p className="text-sm text-gray-300"><strong className="text-white">Note:</strong> Using your own copy trading setup (mirroring your own strategy across your own accounts) is permitted.</p>
                    </div>
                </Stack>
            )
        },
        {
            id: 'payouts',
            title: 'Payout Distributions',
            icon: <DollarSign className="w-6 h-6" />,
            content: (
                <Stack spacing="md">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <h4 className="text-base font-bold text-white mb-2">Frequency</h4>
                            <p className="text-gray-300">Bi-weekly (every 14 days)</p>
                        </div>
                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <h4 className="text-base font-bold text-white mb-2">Profit Split</h4>
                            <p className="text-gray-300">80/20 - You keep 80%</p>
                        </div>
                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <h4 className="text-base font-bold text-white mb-2">Payment Method</h4>
                            <p className="text-gray-300">ZAR via bank transfer</p>
                        </div>
                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <h4 className="text-base font-bold text-white mb-2">Minimum Payout</h4>
                            <p className="text-gray-300">None</p>
                        </div>
                    </div>

                    <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                        <Stack spacing="xs">
                            <h4 className="text-base font-bold text-white">Processing</h4>
                            <p className="text-gray-300">Payouts are delivered directly to your South African bank account. You receive detailed payout statements showing your profit calculations.</p>
                            <p className="text-sm text-gray-400"><strong className="text-white">Note:</strong> The evaluation fee is not refunded upon passing. It is a participation fee, not a deposit.</p>
                        </Stack>
                    </div>
                </Stack>
            )
        },
        {
            id: 'scaling',
            title: 'Scaling Program',
            icon: <TrendingUp className="w-6 h-6" />,
            content: (
                <Stack spacing="md">
                    <p className="text-gray-300">Scaling promotions occur at the end of each quarter. To qualify, a funded trader must meet both requirements:</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <h4 className="text-base font-bold text-white mb-2">Quarterly Return</h4>
                            <p className="text-[#2F6BFF] text-lg font-bold">2%+</p>
                        </div>
                        <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                            <h4 className="text-base font-bold text-white mb-2">Sharpe Ratio</h4>
                            <p className="text-[#2F6BFF] text-lg font-bold">≥ 1.0</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-base font-bold text-white mb-4">Scaling Path</h4>
                        <div className="space-y-2 text-gray-300">
                            <p>• Tier I-III accounts can scale up to <strong className="text-[#2F6BFF]">R500,000</strong></p>
                            <p>• Tier IV accounts can scale up to <strong className="text-[#2F6BFF]">R2,500,000</strong></p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#2F6BFF]/10 to-[#FFA62B]/10 border border-[#2F6BFF]/30 rounded-lg p-5">
                        <Stack spacing="xs">
                            <h4 className="text-base font-bold text-white">Bonus Program</h4>
                            <p className="text-gray-300">Traders who meet the scaling requirements are eligible for a <strong className="text-[#FFA62B]">25% performance bonus</strong> on quarterly realized PnL.</p>
                            <p className="text-sm text-gray-400">This bonus is paid in addition to the standard 80/20 profit split.</p>
                        </Stack>
                    </div>
                </Stack>
            )
        },
        {
            id: 'kyc',
            title: 'KYC & Verification',
            icon: <Lock className="w-6 h-6" />,
            content: (
                <Stack spacing="sm">
                    <div className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-5">
                        <Stack spacing="xs">
                            <h4 className="text-base font-bold text-white">When is KYC Required?</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                    <span><strong className="text-white">Not required</strong> to begin an evaluation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                                    <span><strong className="text-white">Required</strong> when activating your funded account to receive payouts</span>
                                </li>
                            </ul>
                        </Stack>
                    </div>
                    <p className="text-gray-300">Standard KYC verification is required to comply with financial regulations and ensure secure payout processing.</p>
                </Stack>
            )
        },
        {
            id: 'faq',
            title: 'FAQ Quick Reference',
            icon: <Users className="w-6 h-6" />,
            content: (
                <Stack spacing="sm">
                    {[
                        { q: 'Can I trade multiple markets?', a: 'Yes, all funded accounts have access to Forex, Crypto, Indices, and Commodities.' },
                        { q: 'Can I hold trades over the weekend?', a: 'Yes, you can hold positions over the weekend for all supported markets.' },
                        { q: 'Is there a time limit?', a: 'No, there is no time limit on evaluations. However, you must place at least one trade within 30 days of activation.' },
                        { q: 'Are EAs and bots allowed?', a: 'Yes, algorithmic trading is allowed as long as you use your own strategies.' },
                        { q: 'Is news trading allowed?', a: 'Yes, there are no restrictions on trading during news events.' },
                        { q: 'Is copy trading allowed?', a: 'Third-party copy trading is prohibited. Using your own copy trading setup across your own accounts is permitted.' },
                        { q: 'Can I upgrade my evaluation tier?', a: 'No, you cannot upgrade an active evaluation. You must purchase a new evaluation at the desired tier.' },
                        { q: 'Is my evaluation fee refunded if I pass?', a: 'No, the evaluation fee is a participation fee and is not refunded upon passing.' }
                    ].map((faq, index) => (
                        <div key={index} className="bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg p-4">
                            <h5 className="text-white font-semibold mb-2">{faq.q}</h5>
                            <p className="text-gray-300 text-sm">{faq.a}</p>
                        </div>
                    ))}
                </Stack>
            )
        }
    ];

    return (
        <PageContainer maxWidth="xl">
            {/* Hero Section */}
            <PublicPageHeader page="rules">
                <div className="flex flex-wrap gap-4 justify-center mt-8">
                    <Link to="/register" className="inline-block bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                        Start Evaluation
                    </Link>
                    <a href="mailto:support@lemotick.com" className="inline-block bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                        Email Support
                    </a>
                </div>
            </PublicPageHeader>

            {/* Two Column Layout */}
            <PageSection spacing="normal">
                <TwoColumnLayout
                    leftWidth="narrow"
                    gap="sm"
                    sticky={true}
                    left={
                        <div className="hidden lg:block">
                            <PageCard padding="md">
                                <h2 className="text-xs font-bold text-gray-400 uppercase mb-4 px-3">Contents</h2>
                                <nav className="space-y-1">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activeSection === section.id
                                                ? 'bg-[#2F6BFF]/20 text-white border-l-2 border-[#2F6BFF]'
                                                : 'text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10'
                                                }`}
                                        >
                                            {section.title}
                                        </button>
                                    ))}
                                </nav>
                            </PageCard>
                        </div>
                    }
                    right={
                        <div
                            ref={setScrollContainerRef}
                            className="lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2"
                        >
                            <Stack spacing="xl">
                                {sections.map((section, index) => (
                                    <section
                                        key={section.id}
                                        data-section={section.id}
                                        className="scroll-mt-32"
                                    >
                                        <Stack spacing="md">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="text-[#2F6BFF]">{section.icon}</div>
                                                    <h2 className="text-xs font-bold text-gray-400 uppercase">
                                                        Section {String(index + 1).padStart(2, '0')}
                                                    </h2>
                                                </div>
                                                <h3 className="text-xl font-bold text-white">{section.title}</h3>
                                            </div>
                                            <div className="prose prose-invert max-w-none">
                                                {section.content}
                                            </div>
                                        </Stack>
                                    </section>
                                ))}
                            </Stack>

                            {/* Support CTA */}
                            <PageCard className="mt-16 text-center" padding="lg">
                                <Stack spacing="md">
                                    <h2 className="text-lg font-bold text-white">Need Help?</h2>
                                    <p className="text-gray-300">Our support team is here to answer your questions</p>
                                    <a href="mailto:support@lemotick.com" className="inline-block bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                                        Contact Support
                                    </a>
                                </Stack>
                            </PageCard>
                        </div>
                    }
                />
            </PageSection>
        </PageContainer >
    );
}

export default Rules;
