import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, PageGrid, PageSection } from '@/components/ui/PageLayoutEnhanced';
import { Clock, Headphones, Mail, MessageCircle, Phone, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SupportTicket {
    id: string;
    subject: string;
    category: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    created: string;
    lastUpdate: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);

    const tickets: SupportTicket[] = [
        {
            id: 'TKT-001',
            subject: 'Unable to execute trade',
            category: 'Technical',
            status: 'in-progress',
            priority: 'high',
            created: '2024-03-08',
            lastUpdate: '2 hours ago',
        },
        {
            id: 'TKT-002',
            subject: 'Question about withdrawal fees',
            category: 'Billing',
            status: 'resolved',
            priority: 'medium',
            created: '2024-03-07',
            lastUpdate: '1 day ago',
        },
        {
            id: 'TKT-003',
            subject: 'Account verification pending',
            category: 'Account',
            status: 'open',
            priority: 'medium',
            created: '2024-03-06',
            lastUpdate: '2 days ago',
        },
    ];

    const faqs: FAQ[] = [
        {
            id: '1',
            question: 'How do I verify my account?',
            answer: 'To verify your account, go to Settings > Account Verification and upload the required documents (ID, proof of address, and selfie). Verification typically takes 24-48 hours.',
            category: 'Account',
        },
        {
            id: '2',
            question: 'What are the trading fees?',
            answer: 'Trading fees vary by plan: Free plan has 0.5% per trade, Pro plan has 0.3% per trade, and Enterprise plan has 0.1% per trade. Volume discounts are available.',
            category: 'Trading',
        },
        {
            id: '3',
            question: 'How long do withdrawals take?',
            answer: 'Withdrawals are processed within 24 hours. Bank transfers take 1-3 business days, while crypto withdrawals are typically instant after confirmation.',
            category: 'Billing',
        },
        {
            id: '4',
            question: 'Can I change my subscription plan?',
            answer: 'Yes, you can upgrade or downgrade your plan anytime from the Pricing page. Changes take effect immediately, and billing is prorated.',
            category: 'Billing',
        },
        {
            id: '5',
            question: 'Is my data secure?',
            answer: 'Yes, we use bank-level encryption (256-bit SSL) and store sensitive data in encrypted format. We are also compliant with GDPR and SOC 2 standards.',
            category: 'Security',
        },
        {
            id: '6',
            question: 'How do I enable two-factor authentication?',
            answer: 'Go to Settings > Security and click "Enable 2FA". Scan the QR code with your authenticator app and enter the verification code to complete setup.',
            category: 'Security',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'in-progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'resolved': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'closed': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const filteredFAQs = faqs.filter(faq =>
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="SUPPORT CENTER"
                description="Get help and find answers to your questions"
                icon={Headphones}
            />

            {/* Contact Options */}
            <PageSection>
                <PageGrid cols={3}>
                    <button
                        onClick={() => toast.success('Opening live chat...')}
                        className="p-4 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover:transform hover:scale-[1.02] text-left"
                    >
                        <MessageCircle className="w-5 h-5 text-[#2F6BFF] mb-2" />
                        <div className="text-xs font-semibold text-white mb-1">Live Chat</div>
                        <div className="text-xs text-gray-400">Average wait: 2 min</div>
                    </button>

                    <button
                        onClick={() => toast.success('Opening email form...')}
                        className="p-4 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover:transform hover:scale-[1.02] text-left"
                    >
                        <Mail className="w-5 h-5 text-[#2F6BFF] mb-2" />
                        <div className="text-xs font-semibold text-white mb-1">Email Support</div>
                        <div className="text-xs text-gray-400">Response in 24h</div>
                    </button>

                    <button
                        onClick={() => toast.success('Calling support...')}
                        className="p-4 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover:transform hover:scale-[1.02] text-left"
                    >
                        <Phone className="w-5 h-5 text-[#2F6BFF] mb-2" />
                        <div className="text-xs font-semibold text-white mb-1">Phone Support</div>
                        <div className="text-xs text-gray-400">Mon-Fri 9AM-5PM</div>
                    </button>
                </PageGrid>
            </PageSection>

            {/* Support Tickets - 3 COLUMN GRID */}
            <PageSection>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-white uppercase">My Support Tickets</h2>
                    <button
                        onClick={() => setShowNewTicketModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Ticket</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-8">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1347]/90 via-[#16124A]/80 to-[#0B0633]/90 backdrop-blur-xl border border-white/10 hover:border-[#2F6BFF]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#2F6BFF]/20 hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/0 via-[#2F6BFF]/5 to-[#2F6BFF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <div className="relative p-5">
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] flex items-center justify-center shadow-lg shadow-[#2F6BFF]/30 group-hover:shadow-[#2F6BFF]/50 transition-all duration-300 group-hover:scale-110">
                                        <Headphones className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-xs text-gray-400 font-mono">{ticket.id}</span>
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#2F6BFF] transition-colors duration-300 line-clamp-2">
                                            {ticket.subject}
                                        </h3>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 to-[#1E40AF]/5 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/10 rounded-full blur-xl group-hover/metric:bg-[#2F6BFF]/20 transition-all duration-300" />
                                        <div className="relative">
                                            <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Category</div>
                                            <div className="text-sm font-bold text-white truncate">{ticket.category}</div>
                                        </div>
                                    </div>

                                    <div className={`group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br ${ticket.priority === 'high' ? 'from-[#EF4444]/10 to-[#DC2626]/5 border-[#EF4444]/20 hover:border-[#EF4444]/40' : ticket.priority === 'medium' ? 'from-[#F59E0B]/10 to-[#D97706]/5 border-[#F59E0B]/20 hover:border-[#F59E0B]/40' : 'from-[#10B981]/10 to-[#059669]/5 border-[#10B981]/20 hover:border-[#10B981]/40'} border backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                                        <div className={`absolute top-0 right-0 w-16 h-16 ${ticket.priority === 'high' ? 'bg-[#EF4444]/10 group-hover/metric:bg-[#EF4444]/20' : ticket.priority === 'medium' ? 'bg-[#F59E0B]/10 group-hover/metric:bg-[#F59E0B]/20' : 'bg-[#10B981]/10 group-hover/metric:bg-[#10B981]/20'} rounded-full blur-xl transition-all duration-300`} />
                                        <div className="relative">
                                            <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Priority</div>
                                            <div className={`text-sm font-bold ${getPriorityColor(ticket.priority)} capitalize truncate`}>
                                                {ticket.priority}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/5 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 col-span-2">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/10 rounded-full blur-xl group-hover/metric:bg-[#8B5CF6]/20 transition-all duration-300" />
                                        <div className="relative">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Clock className="w-3 h-3 text-[#8B5CF6]" />
                                                <div className="text-[10px] font-semibold text-gray-400 uppercase">Last Update</div>
                                            </div>
                                            <div className="text-sm font-bold text-white">{ticket.lastUpdate}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <button className="w-full group/btn relative overflow-hidden px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] via-[#3B82F6] to-[#2F6BFF] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white transition-all duration-500 shadow-lg shadow-[#2F6BFF]/30 hover:shadow-xl hover:shadow-[#2F6BFF]/50 text-xs font-bold hover:scale-[1.02]">
                                    <span className="relative flex items-center justify-center gap-1.5">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        View Ticket
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Header */}
                <h2 className="text-base font-semibold text-white uppercase mb-4">Frequently Asked Questions</h2>

                {/* FAQ Section - Clean Minimalist Style - 3 COLUMNS */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0633] via-[#16124A] to-[#0B0633] border border-[#2F6BFF]/20 p-8">
                    {/* FAQ Items - 3 COLUMN GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-1">
                        {faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="group relative overflow-hidden rounded-lg border border-transparent hover:border-[#2F6BFF]/30 transition-all duration-300"
                            >
                                <button
                                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                    className="w-full px-4 py-4 flex items-center justify-between gap-4 text-left bg-transparent hover:bg-[#16124A]/50 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-[#2F6BFF] transition-colors duration-300 shrink-0" />
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                                            {faq.question}
                                        </span>
                                    </div>
                                    <div className={`shrink-0 transition-transform duration-300 ${expandedFAQ === faq.id ? 'rotate-45' : ''}`}>
                                        <Plus className="w-4 h-4 text-gray-500 group-hover:text-[#2F6BFF]" />
                                    </div>
                                </button>

                                {/* Expanded Answer */}
                                {expandedFAQ === faq.id && (
                                    <div className="px-4 pb-4 pl-11 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </PageSection>

            {/* New Ticket Modal */}
            {showNewTicketModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowNewTicketModal(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-2xl border border-[#2F6BFF]/30 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white uppercase">Create Support Ticket</h3>
                            <button
                                onClick={() => setShowNewTicketModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-300 mb-2 block font-semibold">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Brief description of your issue"
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF]"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 mb-2 block font-semibold">Category</label>
                                <select className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF]">
                                    <option>Technical</option>
                                    <option>Billing</option>
                                    <option>Account</option>
                                    <option>Trading</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 mb-2 block font-semibold">Priority</label>
                                <select className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF]">
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 mb-2 block font-semibold">Description</label>
                                <textarea
                                    placeholder="Provide detailed information about your issue"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        toast.success('Support ticket created successfully');
                                        setShowNewTicketModal(false);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300"
                                >
                                    Create Ticket
                                </button>
                                <button
                                    onClick={() => setShowNewTicketModal(false)}
                                    className="px-4 py-3 bg-[#0B0633] text-gray-300 rounded-xl text-sm font-semibold hover:bg-[#1E1854] transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </PageContainer>
    );
}
