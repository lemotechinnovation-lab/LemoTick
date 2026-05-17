import { ContentWrapper, PageCard, PageContainer, PageGrid, PageSection, Stack, StatsCard } from '@/components/ui/PageLayoutEnhanced';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { BarChart3, Bitcoin, Check, Clock, DollarSign, Globe, Shield, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

function Markets() {
    const markets = [
        {
            icon: <DollarSign className="w-6 h-6" />,
            title: 'Forex',
            description: 'Trade major, minor, and exotic currency pairs with institutional-grade execution and competitive spreads.',
            pairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD'],
            features: [
                'Major, Minor & Exotic Pairs',
                'Tight Spreads from 0.0 pips',
                'Up to 1:100 Leverage',
                '24/5 Market Access'
            ],
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <Bitcoin className="w-6 h-6" />,
            title: 'Cryptocurrencies',
            description: 'Access the most liquid crypto markets including Bitcoin, Ethereum, and major altcoins with 24/7 trading.',
            pairs: ['BTC/USD', 'ETH/USD', 'XRP/USD', 'LTC/USD', 'ADA/USD', 'SOL/USD'],
            features: [
                '50+ Crypto Pairs',
                '24/7 Market Access',
                'Low Trading Fees',
                'High Volatility Opportunities'
            ],
            color: 'from-orange-500 to-yellow-500'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Indices',
            description: 'Trade global stock indices including S&P 500, NASDAQ, FTSE, and DAX with real-time execution.',
            pairs: ['S&P 500', 'NASDAQ 100', 'FTSE 100', 'DAX 40', 'Nikkei 225', 'ASX 200'],
            features: [
                'Major Global Indices',
                'Extended Trading Hours',
                'Low Margin Requirements',
                'Diversified Exposure'
            ],
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: 'Commodities',
            description: 'Trade precious metals, energy, and agricultural commodities with transparent pricing and deep liquidity.',
            pairs: ['Gold (XAU/USD)', 'Silver (XAG/USD)', 'Crude Oil (WTI)', 'Natural Gas', 'Copper', 'Platinum'],
            features: [
                'Metals & Energy Markets',
                'Hedge Against Inflation',
                'Real-Time Pricing',
                'Global Market Access'
            ],
            color: 'from-green-500 to-emerald-500'
        }
    ];

    const tradingBenefits = [
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Institutional Execution',
            description: 'Prime liquidity with minimal slippage and fast order execution across all markets'
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: '24/7 Support',
            description: 'Round-the-clock customer support and technical assistance for all traders'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Risk Management Tools',
            description: 'Advanced risk controls including stop-loss, take-profit, and trailing stops'
        }
    ];

    const marketSpecs = [
        { icon: <TrendingUp className="w-6 h-6" />, label: 'Total Instruments', value: '200+' },
        { icon: <DollarSign className="w-6 h-6" />, label: 'Forex Pairs', value: '60+' },
        { icon: <Bitcoin className="w-6 h-6" />, label: 'Crypto Assets', value: '50+' },
        { icon: <BarChart3 className="w-6 h-6" />, label: 'Indices', value: '20+' },
        { icon: <Globe className="w-6 h-6" />, label: 'Commodities', value: '15+' },
        { icon: <Clock className="w-6 h-6" />, label: 'Execution Speed', value: '<10ms' }
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
                <PublicPageHeader page="markets" />

                {/* Market Stats Grid */}
                <PageSection spacing="normal">
                    <PageGrid cols={3} gap="sm">
                        {marketSpecs.map((spec, index) => (
                            <StatsCard
                                key={index}
                                icon={spec.icon}
                                value={spec.value}
                                label={spec.label}
                            />
                        ))}
                    </PageGrid>
                </PageSection>

                {/* Markets Grid */}
                <PageSection spacing="normal">
                    <PageGrid cols={2} gap="sm">
                        {markets.map((market, index) => (
                            <PageCard key={index} padding="md" className="hover:border-brand-blue/50 hover:transform hover:scale-[1.02]">
                                <Stack spacing="md">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${market.color} bg-opacity-20 flex items-center justify-center text-white`}>
                                        {market.icon}
                                    </div>
                                    <h3 className="text-xl md:text-xl font-bold text-white">{market.title}</h3>
                                    <p className="text-white leading-relaxed">{market.description}</p>

                                    {/* Popular Pairs */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-brand-blue mb-3 uppercase">Popular Instruments</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {market.pairs.map((pair, pairIndex) => (
                                                <span key={pairIndex} className="px-3 py-1 bg-[#0B0633] border border-brand-blue/30 rounded-lg text-sm text-white">
                                                    {pair}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <Stack spacing="xs">
                                        {market.features.map((feature, featureIndex) => (
                                            <div key={featureIndex} className="flex items-center gap-2 text-white">
                                                <Check className="w-4 h-4 text-green-400 shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </Stack>
                                </Stack>
                            </PageCard>
                        ))}
                    </PageGrid>
                </PageSection>

                {/* Trading Benefits Section */}
                <PageSection spacing="normal">
                    <ContentWrapper maxWidth="text">
                        <Stack spacing="md" className="text-center">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">
                                WHY TRADE WITH LEMOTICK
                            </h2>
                            <p className="text-base text-black">
                                Professional trading infrastructure designed for serious traders
                            </p>
                        </Stack>
                    </ContentWrapper>
                    <PageGrid cols={3} gap="sm" className="mt-8">
                        {tradingBenefits.map((benefit, index) => (
                            <PageCard key={index} padding="md" className="text-center">
                                <Stack spacing="md">
                                    <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 rounded-xl flex items-center justify-center text-brand-blue mx-auto">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
                                    <p className="text-white">{benefit.description}</p>
                                </Stack>
                            </PageCard>
                        ))}
                    </PageGrid>
                </PageSection>

                {/* Market Access Details */}
                <PageSection spacing="normal">
                    <PageCard padding="md" className="bg-gradient-to-br from-[#16124A]/50 to-[#0B0633]/50">
                        <Stack spacing="md">
                            <h2 className="text-xl md:text-2xl font-normal text-white text-center uppercase">
                                COMPREHENSIVE MARKET ACCESS
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                <div>
                                    <h3 className="text-xl font-bold text-brand-blue mb-4">Forex Trading</h3>
                                    <ul className="space-y-3 text-white">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>60+ currency pairs including majors, minors, and exotics</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Spreads from 0.0 pips on major pairs</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Leverage up to 1:100 for experienced traders</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>24/5 trading from Sunday 5pm to Friday 5pm EST</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-blue mb-4">Cryptocurrency Trading</h3>
                                    <ul className="space-y-3 text-white">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>50+ crypto pairs including BTC, ETH, and major altcoins</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>24/7 market access with no weekend restrictions</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Low trading fees and transparent pricing</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>High liquidity on major crypto pairs</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-blue mb-4">Indices Trading</h3>
                                    <ul className="space-y-3 text-white">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>20+ global indices including US, European, and Asian markets</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Extended trading hours covering major sessions</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Low margin requirements for efficient capital usage</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Diversified exposure to global equity markets</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-blue mb-4">Commodities Trading</h3>
                                    <ul className="space-y-3 text-white">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>15+ commodities including precious metals and energy</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Gold and Silver for portfolio diversification</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Energy markets including Crude Oil and Natural Gas</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                            <span>Real-time pricing and transparent execution</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Stack>
                    </PageCard>
                </PageSection>

                {/* Trading Rules Section */}
                <PageSection spacing="normal">
                    <PageCard padding="md" className="bg-[#16124A]/30">
                        <Stack spacing="md">
                            <h2 className="text-xl md:text-2xl font-normal text-white text-center uppercase">
                                FLEXIBLE TRADING RULES
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-brand-blue  mb-1.5">✓</div>
                                    <h3 className="text-lg font-bold text-white  mb-1.5">News Trading Allowed</h3>
                                    <p className="text-white text-sm">Trade during high-impact news events without restrictions</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-brand-blue  mb-1.5">✓</div>
                                    <h3 className="text-lg font-bold text-white  mb-1.5">Weekend Trading</h3>
                                    <p className="text-white text-sm">Trade crypto markets 24/7 including weekends</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-brand-blue  mb-1.5">✓</div>
                                    <h3 className="text-lg font-bold text-white  mb-1.5">All Strategies Welcome</h3>
                                    <p className="text-white text-sm">Scalping, day trading, swing trading - all permitted</p>
                                </div>
                            </div>
                        </Stack>
                    </PageCard>
                </PageSection>

                {/* CTA Section */}
                <PageSection spacing="normal">
                    <PageCard padding="md" className="text-center bg-gradient-to-r from-brand-blue/10 to-accent-orange/10">
                        <Stack spacing="md">
                            <h2 className="text-xl md:text-2xl font-normal text-white uppercase text-center">
                                READY TO START TRADING?
                            </h2>
                            <p className="text-white text-lg">
                                Get funded and access all markets with a single evaluation
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="inline-block bg-gradient-to-r from-brand-blue to-accent-orange text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    Start Evaluation
                                </Link>
                                <Link
                                    to="/how-it-works"
                                    className="inline-block bg-[#16124A] hover:bg-brand-blue/20 border border-brand-blue/30 hover:border-brand-blue text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </Stack>
                    </PageCard>
                </PageSection>
            </PageContainer>
        </div>
    );
}

export default Markets;




