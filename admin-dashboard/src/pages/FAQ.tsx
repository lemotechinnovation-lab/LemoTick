import { PageCard, PageContainer, PageSection, Stack } from '@/components/ui/PageLayoutEnhanced';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function FAQ() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const faqCategories = [
        {
            category: 'Getting Started',
            questions: [
                {
                    id: 'what-is-lemotick',
                    question: 'What is LemoTick?',
                    answer: 'LemoTick is a South African prop trading platform that provides funded accounts to skilled traders. Complete a one-step evaluation to demonstrate consistent profitability, then receive a funded account with an 80/20 profit split, bi-weekly payouts, and the ability to scale up to R2.5 million.'
                },
                {
                    id: 'how-evaluation-works',
                    question: 'How does the Evaluation work?',
                    answer: 'The LemoTick Evaluation is a one-step challenge. You need to achieve a 10% profit target while staying within a 5% maximum drawdown limit. There is no time limit, and you can pass in a single day if you hit the target. Once you pass, your funded account is activated immediately.'
                },
                {
                    id: 'who-can-join',
                    question: 'Who can join?',
                    answer: 'Anyone can join LemoTick and start an evaluation. However, to receive payouts from a funded account, you must complete KYC verification and have a South African bank account for ZAR transfers.'
                },
                {
                    id: 'real-money',
                    question: 'Am I trading with real money?',
                    answer: 'During the evaluation, you trade in a simulated environment. Once you pass and receive your funded account, you trade with real capital and receive real payouts based on your performance (80/20 split).'
                },
                {
                    id: 'verify-identity',
                    question: 'Do I need to verify my identity?',
                    answer: 'KYC verification is not required to begin an evaluation. However, it is required when activating your funded account to receive payouts. This ensures compliance with financial regulations and secure payout processing.'
                }
            ]
        },
        {
            category: 'Evaluation Rules',
            questions: [
                {
                    id: 'leverage',
                    question: 'What leverage can I use during the evaluation?',
                    answer: 'Leverage varies by market: Forex up to 1:100, Crypto 1:5, Indices 1:20, and Commodities 1:50. These limits are enforced automatically by the platform to ensure proper risk management.'
                },
                {
                    id: 'profit-target',
                    question: 'What is the profit target?',
                    answer: '10% of your account balance. For example, on a R100,000 account, you need to achieve R10,000 in profit to pass the evaluation.'
                },
                {
                    id: 'max-drawdown',
                    question: 'What is the maximum drawdown?',
                    answer: '5% maximum drawdown from your starting balance during the evaluation. For example, on a R100,000 account, your equity cannot drop below R95,000 at any time. Breaching this limit results in immediate elimination.'
                },
                {
                    id: 'spreads-fees',
                    question: 'What are the spreads, fees, & slippage for trading?',
                    answer: 'We offer institutional-grade spreads starting from 0.0 pips on major Forex pairs. Trading fees are transparent: 0.05% (5 bps) for most instruments. Slippage is minimal due to our prime liquidity providers.'
                },
                {
                    id: 'time-limit',
                    question: 'Is there a minimum number of trading days or time limit?',
                    answer: 'No time limit - the trading period is unlimited. No minimum trading days - you can pass in a single day. However, you must place at least one trade within 30 days of account activation to keep the account active.'
                },
                {
                    id: 'drawdown-works',
                    question: 'How does the drawdown limit work?',
                    answer: 'During evaluation: 5% static drawdown from starting balance. On funded accounts: 8% trailing drawdown from your high water mark. The drawdown is calculated based on your equity (balance + floating P/L).'
                },
                {
                    id: 'hidden-rules',
                    question: 'Are there any hidden rules?',
                    answer: 'No. The full rule set is: profit target + max drawdown. There are no hidden rules, no consistency requirements, and no single-day profit caps. You may generate any proportion of your profits in a single day.'
                }
            ]
        },
        {
            category: 'Trading Conditions',
            questions: [
                {
                    id: 'platforms',
                    question: 'Which platforms can I trade on?',
                    answer: 'You can trade on our proprietary LemoTick Trading Platform, which provides access to Forex, Crypto, Indices, and Commodities with institutional-grade execution and advanced charting tools.'
                },
                {
                    id: 'trading-style',
                    question: 'Are there restrictions on trading style?',
                    answer: 'No restrictions! All trading styles are permitted including scalping, day trading, swing trading, and position trading. You have complete freedom to implement your strategy.'
                },
                {
                    id: 'eas-bots',
                    question: 'Are EAs, algos, or bots allowed?',
                    answer: 'Yes, algorithmic trading is fully allowed as long as you use your own strategies. Third-party copy trading services are prohibited, but using your own copy trading setup across your own accounts is permitted.'
                },
                {
                    id: 'overnight-weekend',
                    question: 'Can I hold my trades overnight or over the weekend?',
                    answer: 'Yes! You can hold positions overnight and over the weekend for all supported markets. Crypto markets are available 24/7 including weekends. Forex and other markets follow standard trading hours.'
                },
                {
                    id: 'copy-trades',
                    question: 'Can I copy trades?',
                    answer: 'Third-party copy trading (using signals or copy trading services) is strictly prohibited. However, using your own copy trading setup to mirror your own strategy across your own accounts is permitted.'
                },
                {
                    id: 'news-trading',
                    question: 'Is news trading allowed?',
                    answer: 'Yes, there are no restrictions on trading during news events. You can trade freely during high-impact news releases without any limitations.'
                }
            ]
        },
        {
            category: 'Funded Accounts',
            questions: [
                {
                    id: 'pass-evaluation',
                    question: 'What happens when I pass the Evaluation?',
                    answer: 'Your funded account is activated immediately. You receive new trading credentials and can start trading with real capital. You keep 80% of all profits, receive bi-weekly payouts, and become eligible for quarterly scaling.'
                },
                {
                    id: 'funded-leverage',
                    question: 'What leverage can I use on funded accounts?',
                    answer: 'Funded accounts have the same leverage as evaluation accounts: Forex up to 1:100, Crypto 1:5, Indices 1:20, and Commodities 1:50.'
                },
                {
                    id: 'funded-profit-target',
                    question: 'Do Funded Accounts have a profit target?',
                    answer: 'No. There is no profit target on funded accounts. You trade and receive bi-weekly payouts based on your realized profits with an 80/20 split.'
                },
                {
                    id: 'profit-split',
                    question: 'Why does LemoTick offer 80/20 profit splits?',
                    answer: 'We believe in putting traders first. An 80/20 split means you keep 80% of every dollar you earn. This aligns our interests with yours - we succeed when you succeed.'
                },
                {
                    id: 'scaling-available',
                    question: 'Is scaling available?',
                    answer: 'Yes! Scaling promotions occur quarterly. Meet the requirements (2% return + Sharpe ≥ 1.0) and receive account scaling. Tier I-III accounts can scale to R500k, Tier IV to R2.5 million. Plus, earn a 25% performance bonus.'
                },
                {
                    id: 'account-breach',
                    question: 'Can my Funded Account be breached?',
                    answer: 'Yes. If your funded account exceeds the 8% trailing drawdown limit, the account is closed. You may purchase a new evaluation to start again.'
                }
            ]
        },
        {
            category: 'Payouts',
            questions: [
                {
                    id: 'how-payouts-work',
                    question: 'How do payouts work?',
                    answer: 'Payouts are processed bi-weekly (every 14 days) based on your realized profits. You keep 80% of all profits. Payouts are delivered directly to your South African bank account via ZAR transfer.'
                },
                {
                    id: 'payout-delivery',
                    question: 'How are payouts delivered?',
                    answer: 'Payouts are delivered via ZAR bank transfer directly to your South African bank account. You receive detailed payout statements showing your profit calculations and transaction history.'
                },
                {
                    id: 'lemotick-take',
                    question: 'Does LemoTick take any of my profits?',
                    answer: 'LemoTick keeps 20% of profits as our share. You keep 80% of all profits you generate. This is clearly stated upfront with no hidden fees or surprise deductions.'
                },
                {
                    id: 'verifiable-payouts',
                    question: 'Are payouts verifiable or trackable?',
                    answer: 'Yes. All payouts are tracked in your dashboard with detailed statements. You can see your profit calculations, payout history, and transaction records at any time.'
                },
                {
                    id: 'fee-refund',
                    question: 'Is my Evaluation fee refunded?',
                    answer: 'No. The evaluation fee is a participation fee that covers the infrastructure used to verify your performance. It is not refunded upon passing.'
                }
            ]
        },
        {
            category: 'Pricing & Payments',
            questions: [
                {
                    id: 'evaluation-cost',
                    question: 'What does the Evaluation cost?',
                    answer: 'Evaluation fees range from R1,500 (Starter - R10k account) to R15,000 (Tier IV - R250k account). Each tier offers different account sizes and scaling potential. View our Pricing page for full details.'
                },
                {
                    id: 'why-fee',
                    question: 'Why is there a fee?',
                    answer: 'The evaluation fee covers the infrastructure, technology, and resources required to verify your trading performance and provide you with a funded account opportunity. It ensures serious traders who are committed to success.'
                },
                {
                    id: 'discounts',
                    question: 'Do you offer discounts or promos?',
                    answer: 'We occasionally offer promotional discounts and special offers. Follow us on social media or subscribe to our newsletter to stay updated on current promotions.'
                },
                {
                    id: 'payment-methods',
                    question: 'What payment methods do you accept?',
                    answer: 'We accept credit/debit cards, bank transfers (EFT), and cryptocurrency payments. All payments are processed securely through our payment partners.'
                }
            ]
        },
        {
            category: 'Accounts & Platform',
            questions: [
                {
                    id: 'upgrade-tier',
                    question: 'Can I upgrade my Evaluation tier?',
                    answer: 'No, you cannot upgrade an active evaluation tier. You must purchase a new evaluation at the desired tier. Each evaluation is independent.'
                },
                {
                    id: 'multiple-evaluations',
                    question: 'Can I trade multiple Evaluations simultaneously?',
                    answer: 'Yes, you can purchase and trade multiple evaluation accounts simultaneously. Each account is independent with its own rules and tracking.'
                },
                {
                    id: 'switch-market',
                    question: 'Can I switch my market after the Evaluation starts?',
                    answer: 'No. Once an evaluation begins, you have access to all markets (Forex, Crypto, Indices, Commodities) and this cannot be changed. You can trade any or all markets within your account.'
                },
                {
                    id: 'new-credentials',
                    question: 'Do I get new credentials for each Evaluation?',
                    answer: 'Yes, you receive new trading credentials for each evaluation account and for your funded account. This ensures proper tracking and security for each account.'
                }
            ]
        },
        {
            category: 'Policies & Safety',
            questions: [
                {
                    id: 'regulated',
                    question: 'Is LemoTick regulated?',
                    answer: 'LemoTick operates as a prop trading platform and technology facilitator. We follow strict security and privacy standards, and comply with South African financial regulations for payout processing.'
                },
                {
                    id: 'deny-payout',
                    question: 'Can LemoTick deny a payout?',
                    answer: 'Payouts may be withheld only if a trader is found to have violated LemoTick\'s rules or policies (such as using third-party copy trading or account sharing). Traders who follow all rules receive their payouts exactly as calculated.'
                },
                {
                    id: 'data-secure',
                    question: 'Is my data secure?',
                    answer: 'Yes. All account data, payout information, and performance records follow strict security and privacy standards. We use bank-level encryption and secure data storage practices.'
                }
            ]
        },
        {
            category: 'Additional Questions',
            questions: [
                {
                    id: 'contact-support',
                    question: 'Where can I contact support?',
                    answer: 'You can contact our support team via email at support@lemotick.com. We aim to respond to all inquiries within 24 hours during business days.'
                },
                {
                    id: 'team-behind',
                    question: 'Who is the team behind LemoTick?',
                    answer: 'LemoTick is built by experienced traders, engineers, and financial professionals focused on modernizing prop trading fairly and transparently in South Africa. Learn more on our About page.'
                },
                {
                    id: 'affiliate-program',
                    question: 'Do you offer an affiliate program?',
                    answer: 'Yes! We offer a competitive affiliate program. Contact us at partnerships@lemotick.com for more information about becoming a LemoTick affiliate partner.'
                },
                {
                    id: 'leaderboards',
                    question: 'Where can I view trader performance or leaderboards?',
                    answer: 'Trader leaderboards and performance statistics are available in your dashboard once you have an active account. This feature helps you benchmark your performance against other traders.'
                }
            ]
        }
    ];

    const toggleQuestion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

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
                <PublicPageHeader page="faq" />

                {/* FAQ Categories - 2 Column Grid */}
                <PageSection spacing="normal">
                    {faqCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-16 last:mb-0">
                            <h2 className="text-xl md:text-xl font-bold text-white mb-8 text-center uppercase">
                                {category.category}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-1">
                                {category.questions.map((faq) => (
                                    <div
                                        key={faq.id}
                                        className="border-b border-gray-700/50 py-6"
                                    >
                                        <button
                                            onClick={() => toggleQuestion(faq.id)}
                                            className="w-full text-left flex items-start justify-between gap-4 group"
                                        >
                                            <span className="text-base font-medium text-white group-hover:text-brand-blue transition-colors flex-1">
                                                <span className="text-gray-500 mr-2">—</span>
                                                {faq.question}
                                            </span>
                                            {openIndex === faq.id ? (
                                                <Minus className="w-4 h-4 text-brand-blue shrink-0 mt-1" />
                                            ) : (
                                                <Plus className="w-4 h-4 text-gray-400 group-hover:text-brand-blue shrink-0 mt-1 transition-colors" />
                                            )}
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${openIndex === faq.id ? 'max-h-96 mt-4' : 'max-h-0'
                                                }`}
                                        >
                                            <p className="text-gray-400 leading-relaxed text-sm pl-5">{faq.answer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </PageSection>

                {/* CTA Section */}
                <PageSection spacing="normal">
                    <PageCard padding="md" className="text-center bg-gradient-to-r from-brand-blue/10 to-accent-orange/10">
                        <Stack spacing="md">
                            <h2 className="text-2xl font-bold text-white">Still Have Questions?</h2>
                            <p className="text-base text-white">Our team is here to help</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="mailto:support@lemotick.com"
                                    className="inline-block bg-[#16124A] hover:bg-brand-blue/20 border border-brand-blue/30 hover:border-brand-blue text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300"
                                >
                                    Contact Support
                                </a>
                                <Link
                                    to="/register"
                                    className="inline-block bg-gradient-to-r from-brand-blue to-accent-orange text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    Begin Your Evaluation
                                </Link>
                            </div>
                        </Stack>
                    </PageCard>
                </PageSection>
            </PageContainer>
        </div>
    );
}

export default FAQ;




