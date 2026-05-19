import { PageHeader } from '@/components/ui/PageHeader';
import { PageCard, PageContainer, PageGrid, PageSection } from '@/components/ui/PageLayoutEnhanced';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PricingPlan {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    notIncluded: string[];
    popular: boolean;
    current: boolean;
}

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [currency, setCurrency] = useState<'USD' | 'ZAR'>('ZAR');

    const exchangeRate = 18.5; // USD to ZAR approximate rate

    const plans: PricingPlan[] = [
        {
            id: 'free',
            name: 'Free',
            description: 'Perfect for getting started',
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: [
                'Up to 10 trades per month',
                'Basic market data',
                'Email support',
                'Mobile app access',
                'Basic charts',
            ],
            notIncluded: [
                'Advanced analytics',
                'Priority support',
                'API access',
                'Custom indicators',
            ],
            popular: false,
            current: true,
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'For serious traders',
            monthlyPrice: 29,
            yearlyPrice: 290,
            features: [
                'Unlimited trades',
                'Real-time market data',
                'Priority email support',
                'Advanced charts & indicators',
                'Portfolio analytics',
                'Price alerts',
                'Export reports',
            ],
            notIncluded: [
                'API access',
                'Dedicated account manager',
                'Custom integrations',
            ],
            popular: true,
            current: false,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'For professional teams',
            monthlyPrice: 99,
            yearlyPrice: 990,
            features: [
                'Everything in Pro',
                'API access',
                'Dedicated account manager',
                'Custom integrations',
                'Advanced security',
                'Team collaboration',
                'White-label options',
                'SLA guarantee',
            ],
            notIncluded: [],
            popular: false,
            current: false,
        },
    ];

    const handleUpgrade = (planId: string) => {
        toast.success(`Upgrading to ${planId} plan...`);
    };

    const getPrice = (plan: PricingPlan) => {
        const basePrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
        if (currency === 'ZAR') {
            return Math.round(basePrice * exchangeRate);
        }
        return basePrice;
    };

    const getCurrencySymbol = () => {
        return currency === 'USD' ? '$' : 'R';
    };

    const getSavings = (plan: PricingPlan) => {
        if (billingCycle === 'yearly' && plan.monthlyPrice > 0) {
            const monthlyCost = plan.monthlyPrice * 12;
            const yearlyCost = plan.yearlyPrice;
            const savingsUSD = monthlyCost - yearlyCost;
            if (currency === 'ZAR') {
                return Math.round(savingsUSD * exchangeRate);
            }
            return savingsUSD;
        }
        return 0;
    };

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                variant="hero"
                title="PRICING PLANS"
                description="Choose the perfect plan for your trading needs"
            />

            {/* Billing Toggle */}
            <PageSection>
                <div className="flex items-center justify-center gap-4">
                    {/* Currency Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Currency:</span>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as 'USD' | 'ZAR')}
                            className="px-3 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-sm text-white focus:outline-none focus:border-[#2F6BFF]"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="ZAR">ZAR (R)</option>
                        </select>
                    </div>

                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${billingCycle === 'yearly' ? 'bg-[#2F6BFF]' : 'bg-gray-600'}`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                            Yearly
                            <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                Save 17%
                            </span>
                        </span>
                    </div>
                </div>
            </PageSection>

            {/* Pricing Cards */}
            <PageSection>
                <PageGrid cols={3}>
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${plan.popular
                                ? 'border-[#2F6BFF] shadow-lg shadow-[#2F6BFF]/20'
                                : 'border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] text-white rounded-full text-xs font-bold shadow-lg">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            {/* Current Plan Badge */}
                            {plan.current && (
                                <div className="absolute top-4 right-4">
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                        CURRENT
                                    </span>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-sm text-gray-400">{plan.description}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">{getCurrencySymbol()}{getPrice(plan)}</span>
                                    <span className="text-sm text-gray-400">
                                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                                    </span>
                                </div>
                                {getSavings(plan) > 0 && (
                                    <p className="text-xs text-green-400 mt-2">
                                        Save {getCurrencySymbol()}{getSavings(plan)} per year
                                    </p>
                                )}
                            </div>

                            {/* Features */}
                            <div className="mb-6 space-y-3">
                                {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-2 opacity-40">
                                        <X size={16} className="text-gray-500 shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-500 line-through">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={plan.current}
                                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${plan.popular
                                    ? 'bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] text-white hover:shadow-lg hover:shadow-[#2F6BFF]/20'
                                    : plan.current
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#16124A] text-white border border-[#2F6BFF]/30 hover:bg-[#1E1854]'
                                    }`}
                            >
                                {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </PageGrid>
            </PageSection>

            {/* FAQ Section */}
            <PageSection>
                <PageCard padding="lg">
                    <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2">Can I change plans anytime?</h3>
                            <p className="text-sm text-gray-400">
                                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2">What payment methods do you accept?</h3>
                            <p className="text-sm text-gray-400">
                                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2">Is there a free trial?</h3>
                            <p className="text-sm text-gray-400">
                                Yes, all paid plans come with a 14-day free trial. No credit card required.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2">Can I cancel my subscription?</h3>
                            <p className="text-sm text-gray-400">
                                Yes, you can cancel anytime. You'll continue to have access until the end of your billing period.
                            </p>
                        </div>
                    </div>
                </PageCard>
            </PageSection>
        </PageContainer>
    );
}


